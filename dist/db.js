"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const businessError_table_1 = require("./businessError.table");
const businessError_1 = require("./entities/businessError");
const policy_1 = require("./policy");
class DB {
    constructor(options) {
        if (!options.db) {
            throw new Error("db config is required");
        }
        this.config = {
            type: options.type,
            host: options.host,
            port: options.port,
            username: options.username,
            password: options.password,
            database: options.database,
            logging: options.logging,
        };
    }
    async init() {
        let connection = await typeorm_1.createConnection(Object.assign({}, this.config.db));
        this.connection = connection;
        //创建database
        let queryRunner = connection.createQueryRunner();
        await queryRunner.createDatabase("kafka-error-retry", true);
        //创建business_errors表
        await queryRunner.createTable(businessError_table_1.default("business_errors"), true);
        return connection;
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
            return;
        }
        let be = new businessError_1.default();
        be.dataId = dataId;
        be.topic = topic;
        be.key = key;
        be.retryCount = 1;
        be.nextTime = policyInst.getNextTimeByPolicy(beData.retryCount, policy);
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
        let beRepository = this.connection.getRepository(businessError_1.default);
        return await beRepository.find({
            where: {
                nextTime: typeorm_1.LessThan(new Date())
            },
            order: {
                updatedAt: "ASC"
            },
            take: 1000
        });
    }
}
exports.default = DB;
//# sourceMappingURL=db.js.map