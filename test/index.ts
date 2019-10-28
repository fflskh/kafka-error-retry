
import {KafkaErrorHandler} from "../src/index";

async function test() {
  let handler = KafkaErrorHandler.getInstance({
    db: {
      type: "mysql",
      host: "127.0.0.1",
      port: 3306,
      username: "root",
      password: "12345678",
      // database: "kafka-error-retry",
      logging: true
    },
    kafka: {
      brokers: "127.0.0.1:9092",
      partitions: 8,
      replicas: 1
    },
    policy: {
      retryCount: 10,
      backoff: true
    },
    scheduleRule: "*/10 * * * * *",
    logger: function(msg) {
      console.info({
        message: msg
      });
    }
  });

  await handler.initialize();
  await handler.runRetryTask();
}


test().then().catch(console.error);