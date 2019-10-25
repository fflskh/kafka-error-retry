"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const kafka_1 = require("./kafka");
const db_1 = require("./db");
const schedule = require("node-schedule");
class KafkaErrorHandler {
    /**
     * HandlerConfig配置
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
        this.hasRun = false;
        this.hasInitialized = false;
        if (!options.db) {
            throw new Error("db config is required.");
        }
        if (!options.kafka) {
            throw new Error("kafka config is required.");
        }
        this.config = {
            db: {},
            kafka: {},
        };
        this.config.db = options.db;
        this.config.kafka = options.kafka;
        if (options.policy) {
            this.policy = options.policy;
        }
        //默认每分钟的第一秒执行
        if (!options.scheduleRule) {
            this.scheduleRule = "1 * * * * *";
        }
        else {
            this.scheduleRule = options.scheduleRule;
        }
        this.kafka = new kafka_1.default(Object.assign({}, this.config.kafka));
        this.db = new db_1.default(Object.assign({}, this.config.db));
    }
    static getInstance(options) {
        if (!this.instance) {
            this.instance = new KafkaErrorHandler(options);
        }
        return this.instance;
    }
    async initialize() {
        if (this.hasInitialized) {
            return;
        }
        //1.连接kafka，并初始化kafka topic、连接kafka
        await this.kafka.connect();
        //2.连接db，并初始化数据库及表
        await this.db.init();
        this.hasInitialized = true;
    }
    async runRetryTask() {
        if (this.hasRun) {
            return;
        }
        if (!this.hasInitialized) {
            throw new Error("call initialize function first");
        }
        //运行重试任务
        schedule.scheduleJob(this.scheduleRule, async () => {
            let topics = await this.db.getRetryTopics();
            console.log(`获得${topics.length}条需要重试的topics`);
            for (let topic of topics) {
                await this.kafka.push(topic.topic, topic.key, topic.value);
            }
        });
        this.hasRun = true;
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
        if (!this.hasInitialized) {
            throw new Error("call initialize function first");
        }
        await this.db.pushError(data, this.policy);
    }
    /**
     * 之前处理错误的kafka消息，再次消费成功后，通知本服务删除消息
     * @param data
     * @param data.topic
     * @param data.dataId
     */
    async notifySuccess(data) {
        if (!this.hasInitialized) {
            throw new Error("call initialize function first");
        }
        await this.db.processSuccessTopic(data);
    }
}
exports.default = KafkaErrorHandler;
