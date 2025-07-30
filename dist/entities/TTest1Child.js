var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, } from "typeorm";
import { TTest1 } from "./TTest1";
let TTest1Child = class TTest1Child {
    id;
    comment;
    createdDt;
    test1;
};
__decorate([
    PrimaryGeneratedColumn({ type: "integer", name: "id" }),
    __metadata("design:type", Number)
], TTest1Child.prototype, "id", void 0);
__decorate([
    Column("character varying", {
        name: "comment",
        nullable: true,
        default: () => "''''''",
    }),
    __metadata("design:type", Object)
], TTest1Child.prototype, "comment", void 0);
__decorate([
    Column("timestamp with time zone", {
        name: "created_dt",
        nullable: true,
        default: () => "now()",
    }),
    __metadata("design:type", Object)
], TTest1Child.prototype, "createdDt", void 0);
__decorate([
    ManyToOne(() => TTest1, (tTest1) => tTest1.tTest1Children, {
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    }),
    JoinColumn([{ name: "test1_id", referencedColumnName: "id" }]),
    __metadata("design:type", typeof (_a = typeof TTest1 !== "undefined" && TTest1) === "function" ? _a : Object)
], TTest1Child.prototype, "test1", void 0);
TTest1Child = __decorate([
    Index("t_test1_child_pkey", ["id"], { unique: true }),
    Entity("t_test1_child", { schema: "public" })
], TTest1Child);
export { TTest1Child };
