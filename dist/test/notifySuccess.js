"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../src/index");
function sleep(ms) {
    return new Promise((resolve, reject) => {
        setTimeout(function () {
            resolve();
        }, ms);
    });
}
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
        scheduleRule: "1 * * * * *"
    });
    await handler.initialize();
    await handler.pushError({
        topic: "test",
        key: "test-1",
        value: "test data",
        dataId: "1"
    });
    await sleep(10000);
    await handler.notifySuccess({
        topic: "test",
        dataId: 1
    });
}
test().then().catch(console.error);
