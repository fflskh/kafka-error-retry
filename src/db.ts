
import { createConnection, Connection, LessThan } from "typeorm";
import getTable from "./businessError.table";
import BusinessErrors from "./entity/businessError";
import Policy from "./policy";

export default class DB {

  config
  connection: Connection
  policy: Policy

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
      // database: options.database,
      logging: options.logging,
      entities: [
        __dirname + "/entity/*.ts"
      ]
    }
  }

  async init() {
    //该连接用于创建db
    let connectionForCreateDb = await createConnection({
      ...this.config,
      database: "sys",
      name: "createDBConnection",
    });

    //创建database
    let dbQueryRunner = connectionForCreateDb.createQueryRunner();
    await dbQueryRunner.createDatabase("kafka-error-retry", true);

    //该连接用于创建表格
    let connectionForCreateTable = await createConnection({
      ...this.config,
      database: "kafka-error-retry",
      entities: [
        __dirname + "/entity/*.ts"
      ]
    });
    let tableQueryRunner = connectionForCreateTable.createQueryRunner();
    //创建business_errors表
    await tableQueryRunner.createTable(getTable("business_errors"), true);

    this.connection = connectionForCreateTable;
    return this.connection;
  }

  async pushError(data, policy) {
    let { topic, key, dataId, value } = data;
    let beRepository = this.connection.getRepository(BusinessErrors);
    let policyInst = new Policy();

    let beData = await beRepository.findOne({
      topic: topic,
      dataId: dataId
    });

    if (beData) {
      beData.retryCount += 1;
      beData.nextTime = policyInst.getNextTimeByPolicy(beData.retryCount, policy);
      return;
    }

    let be = new BusinessErrors();
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
    let beRepository = this.connection.getRepository(BusinessErrors);

    await beRepository.delete({
      topic: topic,
      dataId: dataId
    });
  }

  async getRetryTopics() {
    // let beRepository = this.connection.getRepository(BusinessErrors);
    // BusinessErrors.find()

    return await BusinessErrors.find({
      where: {
        nextTime: LessThan(new Date())
      },
      order: {
        updatedAt: "ASC"
      },
      take: 1000
    });
  }
}