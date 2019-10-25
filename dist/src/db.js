"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const businessError_table_1 = require("./businessError.table");
const businessError_1 = require("./entity/businessError");
const policy_1 = require("./policy");
class DB {
    constructor(options) {
        if (!options) {
            throw new Error("db config is required");
        }
        this.config = {
            type: options.type,
            host: options.host,
            port: options.port,
            username: options.username,
            password: options.password,
            logging: options.logging,
            entities: [
                __dirname + "/entity/*.ts"
            ]
        };
    }
    async init() {
        //该连接用于创建db
        let connectionForCreateDb = await typeorm_1.createConnection(Object.assign(Object.assign({}, this.config), { database: "sys", name: "createDBConnection" }));
        //创建database
        let dbQueryRunner = connectionForCreateDb.createQueryRunner();
        await dbQueryRunner.createDatabase("kafka-error-retry", true);
        //关闭连接
        await connectionForCreateDb.close();
        //该连接用于创建表格
        let connectionForCreateTable = await typeorm_1.createConnection(Object.assign(Object.assign({}, this.config), { database: "kafka-error-retry", entities: [
                __dirname + "/entity/*"
            ] }));
        let tableQueryRunner = connectionForCreateTable.createQueryRunner();
        //创建business_errors表
        await tableQueryRunner.createTable(businessError_table_1.default("business_errors"), true);
        this.connection = connectionForCreateTable;
        return this.connection;
    }
    async pushError(data, policy) {
        let { topic, key, dataId, value } = data;
        let beRepository = this.connection.getRepository(businessError_1.default);
        let policyInst = new policy_1.default();
        let beData = await beRepository.findOne({
            topic: topic,
            dataId: dataId
        });
        if (beData) {
            beData.retryCount += 1;
            beData.nextTime = policyInst.getNextTimeByPolicy(beData.retryCount, policy);
            if (beData.retryCount >= policy.retryCount) {
                beData.reachMaxRetryCount = 1;
            }
            beData.save();
            return;
        }
        let be = new businessError_1.default();
        be.dataId = dataId;
        be.topic = topic;
        be.key = key;
        be.retryCount = 1;
        be.nextTime = policyInst.getNextTimeByPolicy(be.retryCount, policy);
        be.value = value;
        be.policy = JSON.stringify(policy);
        await beRepository.save(be);
    }
    async processSuccessTopic(data) {
        let { topic, dataId } = data;
        let beRepository = this.connection.getRepository(businessError_1.default);
        await beRepository.delete({
            topic: topic,
            dataId: dataId
        });
    }
    async getRetryTopics() {
        return await businessError_1.default.find({
            where: {
                nextTime: typeorm_1.LessThan(new Date()),
                reachMaxRetryCount: 0
            },
            order: {
                updatedAt: "ASC"
            },
            take: 1000
        });
    }
}
exports.default = DB;
