"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
let BusinessErrors = class BusinessErrors extends typeorm_1.BaseEntity {
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn({
        type: "bigint",
        name: "id"
    }),
    __metadata("design:type", Number)
], BusinessErrors.prototype, "id", void 0);
__decorate([
    typeorm_1.Column("varchar", {
        length: 128,
        name: "dataId",
        nullable: false
    }),
    __metadata("design:type", String)
], BusinessErrors.prototype, "dataId", void 0);
__decorate([
    typeorm_1.Column("varchar", {
        length: 128,
        name: "topic"
    }),
    __metadata("design:type", String)
], BusinessErrors.prototype, "topic", void 0);
__decorate([
    typeorm_1.Column("varchar", {
        length: 128,
        name: "key"
    }),
    __metadata("design:type", String)
], BusinessErrors.prototype, "key", void 0);
__decorate([
    typeorm_1.Column("text"),
    __metadata("design:type", String)
], BusinessErrors.prototype, "policy", void 0);
__decorate([
    typeorm_1.Column("text"),
    __metadata("design:type", String)
], BusinessErrors.prototype, "value", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", Number)
], BusinessErrors.prototype, "retryCount", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", Date)
], BusinessErrors.prototype, "nextTime", void 0);
__decorate([
    typeorm_1.UpdateDateColumn(),
    __metadata("design:type", Date)
], BusinessErrors.prototype, "updatedAt", void 0);
__decorate([
    typeorm_1.CreateDateColumn(),
    __metadata("design:type", Date)
], BusinessErrors.prototype, "createdAt", void 0);
BusinessErrors = __decorate([
    typeorm_1.Entity()
], BusinessErrors);
exports.default = BusinessErrors;
