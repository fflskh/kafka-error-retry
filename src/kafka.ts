import NodeKafka = require("node-rdkafka");
import fnv = require("fnv-plus");

function getHashCode(uuid) {
  let ahash64 = fnv.hash(uuid, 32);
  return ahash64.dec();
}

export default class Kafak {
  config
  connected = false
  producer
  logger

  constructor(options) {
    if (!options.brokers) {
      throw new Error("kafka config is required");
    }
    this.config = {};
    this.config.brokers = options.brokers;
    this.config.partitions = options.partitions;
    this.config.replicas = options.replicas;
    this.logger = options.logger;
  }

  private createProducer() {
    return new NodeKafka.Producer({
      "metadata.broker.list": this.config.brokers,
      dr_cb: true,
      "socket.max.fails": 0,
      //Maximum number of messages allowed on the producer queue. default=100000
      "queue.buffering.max.messages": 1000000,
      "socket.keepalive.enable": true, //Enable TCP keep-alives (SO_KEEPALIVE) on broker sockets
      "log.connection.close": false //Log broker disconnects. It might be useful to turn this off when interacting with 0.9 brokers with an aggressive connection.max.idle.ms value.
      // "request.required.acks": -1, //This field indicates how many acknowledgements the leader broker must receive from ISR brokers before responding to the request: 0=Broker does not send any response/ack to client, 1=Only the leader broker will need to ack the message, -1 or all=broker will block until message is committed by all in sync replicas (ISRs) or broker's min.insync.replicas setting before sending response.
      // "retry.backoff.ms": 100, //The backoff time in milliseconds before retrying a protocol request.
      // "compression.codec": "gzip", //compression codec to use for compressing message sets. This is the default value for all topics, may be overridden by the topic configuration property compression.codec.
      // "queue.buffering.max.ms": 50 //Delay in milliseconds to wait for messages in the producer queue to accumulate before constructing message batches (MessageSets) to transmit to brokers. A higher value allows larger and more effective (less overhead, improved compression) batches of messages to accumulate at the expense of increased message delivery latency.
    });
  }

  connect() {
    this.producer = this.createProducer();

    this.producer.connect();

    // Polls the producer on this interval, handling disconnections and reconnection. Set it to 0 to turn it off.
    this.producer.setPollInterval(1000);

    this.producer
      .on("delivery-report", (error, report) => {
        if (error) {
          this.logger({
            message: "get delivery-report error",
            error: error.stack
          });
        } else {
          // this.logger({ message: "delivery-report", data: report });
        }
      })
      .on("event.error", error => {
        this.logger({
          message: "kafka event.error",
          error: error.stack
        });
      }).on("connection.failure", error => {
        this.logger({
          message: "producer.connection.failure",
          error: error.stack
        });
      });

    return new Promise((resolve, reject) => {
      this.producer
        .on("ready", () => {
          this.connected = true;
          resolve();
        })
        .on("connection.failure", error => {
          reject(error);
        });
    });
  }

  async push(topic, key, value) {
    if (!key && !topic && !value) {
      throw new Error("kafka data format is error");
    }

    let partition = getHashCode(key) % this.config.partitions;
    value = typeof value === "string" ? JSON.parse(value) : value;
    value.fromRetry = true;

    let date = new Date().getTime();
    try {
      let produceRes = await this.producer.produce(topic, partition, Buffer.from(JSON.stringify(value)), key, date);
      //生产消息失败，则将消息暂存到redis，后台任务遍历redis重新将生产消息
      if (!produceRes) {
        this.logger({
          message: `kafka push 【${topic}->${partition}】error,key:${key}`,
          data: value
        });
      } else {
        this.logger({
          message: `kafka push 【${topic}->${partition}】success,key:${key}`,
          data: value
        });
      }
      return produceRes;
    } catch (error) {
      this.logger({
        message: `produce topic【${topic}】failed`,
        error: error.stack
      });
    }
  }
}