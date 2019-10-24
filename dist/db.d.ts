import { Connection } from "typeorm";
import BusinessErrors from "./entities/businessError";
import Policy from "./policy";
export default class DB {
    config: any;
    connection: Connection;
    policy: Policy;
    constructor(options: any);
    init(): Promise<Connection>;
    pushError(data: any, policy: any): Promise<void>;
    processSuccessTopic(data: any): Promise<void>;
    getRetryTopics(): Promise<BusinessErrors[]>;
}
