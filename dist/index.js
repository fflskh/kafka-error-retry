"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const kafka_1 = require("./kafka");
const db_1 = require("./db");
const schedule = require("node-schedule");
class KafkaErrorHandler {
    /**
     *
     * @param options
     * {
     *   "db": {
     *    type: "mysql",   //db类型
     *    host: "127.0.0.1",  //地址
     *    port: "3306", //端口
     *    username: "admin",  //用户名
     *    password: "admin",  //密码
     *    database: "test_db",  //db
     *    logging: true,
     *   },
     *   "kafka": {
     *     "brokers": "127.0.0.1:9092",  //地址
     *     "partitions": 3, //分区
     *     "replicas": 1   //副本，需要根据实际的机器数量来确定
     *   },
     *   "policy": {
     *     "retryCount": 10,
     *     "backoff": true/false
     *   }
     * }
     */
    constructor(options) {
        if (!options.db) {
            throw new Error("db config is required.");
        }
        if (!options.kafka) {
            throw new Error("kafka config is required.");
        }
        this.config = {};
        this.config.db = options.db;
        this.config.kafka = options.kafka;
        if (options.policy) {
            this.policy = options.policy;
        }
        //默认每分钟的第一秒执行
        if (!options.scheduleRule) {
            this.scheduleRule = "1 * * * * *";
        }
        this.kafka = new kafka_1.default(Object.assign({}, this.config.kafka));
        this.db = new db_1.default(Object.assign({}, this.config.db));
    }
    async run() {
        //1.连接kafka，并初始化kafka topic、连接kafka
        await this.kafka.connect();
        //2.连接db，并初始化数据库及表
        await this.db.init();
        //3.运行重试任务
        this.runRetryTask();
    }
    /**
     * 将error发送到错误处理
     * @param data
     * @param data.topic
     * @param data.key
     * @param data.value
     * @param data.dataId
     */
    async pushError(data) {
        await this.db.pushError(data, this.policy);
    }
    /**
     * 之前处理错误的kafka消息，再次消费成功后，通知本服务删除消息
     * @param data
     * @param data.topic
     * @param data.dataId
     */
    async notifySuccess(data) {
        await this.db.processSuccessTopic(data);
    }
    //运行重试任务
    async runRetryTask() {
        let topics = await this.db.getRetryTopics();
        schedule.scheduleJob(this.scheduleRule, async () => {
            for (let topic of topics) {
                await this.kafka.push(topic.topic, topic.key, topic.value);
            }
        });
    }
}
exports.default = KafkaErrorHandler;
//# sourceMappingURL=index.js.map