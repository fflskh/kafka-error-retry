import Policy from "./policy";
import Kafka from "./kafka";
import DB from "./db";
interface HandlerConfig {
    db: any;
    kafka: any;
    policy?: any;
    scheduleRule?: string;
}
export default class KafkaErrorHandler {
    private static instance;
    config: HandlerConfig;
    retryPolicy: Policy;
    kafka: Kafka;
    db: DB;
    policy: Policy;
    scheduleRule: string;
    hasRun: boolean;
    hasInitialized: boolean;
    static getInstance(options: any): KafkaErrorHandler;
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
    private constructor();
    initialize(): Promise<void>;
    runRetryTask(): Promise<void>;
    /**
     * 将error发送到错误处理
     * @param data
     * @param data.topic
     * @param data.key
     * @param data.value
     * @param data.dataId
     */
    pushError(data: any): Promise<void>;
    /**
     * 之前处理错误的kafka消息，再次消费成功后，通知本服务删除消息
     * @param data
     * @param data.topic
     * @param data.dataId
     */
    notifySuccess(data: any): Promise<void>;
}
export {};
