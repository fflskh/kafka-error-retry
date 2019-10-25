import { Table } from "typeorm";

export default function getTable(tableName): Table  {
  return new Table({
    name: tableName,
    columns: [
      {
        name: "id",
        type: "bigint",
        comment: "ID",
        isGenerated: true,
        generationStrategy: "increment",
        isPrimary: true,
        isNullable: false
      },
      {
        name: "dataId",
        type: "varchar(128)",
        isNullable: false
      },
      {
        name: "topic",
        type: "varchar(128)",
        isNullable: false
      },
      {
        name: "key",
        type: "varchar(128)",
        isNullable: false
      },
      {
        name: "policy",
        type: "text",
        isNullable: true,
      },
      {
        name: "value",
        type: "text",
        isNullable: false
      },
      {
        name: "retryCount",
        type: "int",
        isNullable: true
      },
      {
        name: "nextTime",
        type: "datetime",
        isNullable: true
      },
      {
        name: "reachMaxRetryCount",
        type: "int",
        default: 0,
        isNullable: true
      },
      {
        name: "createdAt",
        type: "datetime",
        default: "now()"
      },
      {
        name: "updatedAt",
        type: "datetime",
        default: "now()"
      }
    ]
  });
}
