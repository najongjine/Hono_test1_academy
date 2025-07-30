var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Column, Entity, Index, OneToMany, PrimaryGeneratedColumn, } from "typeorm";
import { TTest1Child } from "./TTest1Child";
let TTest1 = class TTest1 {
    id;
    title;
    content;
    createdDt;
    tTest1Children;
};
__decorate([
    PrimaryGeneratedColumn({ type: "integer", name: "id" }),
    __metadata("design:type", Number)
], TTest1.prototype, "id", void 0);
__decorate([
    Column("character varying", {
        name: "title",
        nullable: true,
        default: () => "''''''",
    }),
    __metadata("design:type", Object)
], TTest1.prototype, "title", void 0);
__decorate([
    Column("character varying", {
        name: "content",
        nullable: true,
        default: () => "''''''",
    }),
    __metadata("design:type", Object)
], TTest1.prototype, "content", void 0);
__decorate([
    Column("timestamp with time zone", {
        name: "created_dt",
        nullable: true,
        default: () => "now()",
    }),
    __metadata("design:type", Object)
], TTest1.prototype, "createdDt", void 0);
__decorate([
    OneToMany(() => TTest1Child, (tTest1Child) => tTest1Child.test1),
    __metadata("design:type", Array)
], TTest1.prototype, "tTest1Children", void 0);
TTest1 = __decorate([
    Index("t_test1_pkey", ["id"], { unique: true }),
    Entity("t_test1", { schema: "public" })
], TTest1);
export { TTest1 };
