import { BaseEntity } from "typeorm";
export default class BusinessErrors extends BaseEntity {
    id: number;
    dataId: string;
    topic: string;
    key: string;
    policy: string;
    value: string;
    retryCount: number;
    nextTime: Date;
    reachMaxRetryCount: number;
    updatedAt: Date | null;
    createdAt: Date | null;
}
