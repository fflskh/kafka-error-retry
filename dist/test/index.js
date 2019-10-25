"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../src/index");
async function test() {
    let handler = index_1.default.getInstance({
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
        scheduleRule: "*/10 * * * * *"
    });
    await handler.initialize();
    await handler.runRetryTask();
}
test().then().catch(console.error);
