"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
function getTable(tableName) {
    return new typeorm_1.Table({
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
                type: "date",
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
exports.default = getTable;
