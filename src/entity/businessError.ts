import {Entity, PrimaryGeneratedColumn, Column, BaseEntity, CreateDateColumn, UpdateDateColumn} from "typeorm";

@Entity()
export default class BusinessErrors extends BaseEntity{

    @PrimaryGeneratedColumn({
      type: "bigint",
      name: "id"
    })
    id: number;

    @Column("varchar", {
      length: 128,
      name: "dataId",
      nullable: false
    })
    dataId: string;

    @Column("varchar", {
      length: 128,
      name: "topic"
    })
    topic: string;

    @Column("varchar", {
      length: 128,
      name: "key"
    })
    key: string;

    @Column("text")
    policy: string;

    @Column("text")
    value: string;

    @Column()
    retryCount: number;

    @Column()
    nextTime: Date;

    @UpdateDateColumn()
    updatedAt: Date | null;

    @CreateDateColumn()
    createdAt: Date | null;
}