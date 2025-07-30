import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { TTest1 } from "./TTest1";

@Index("t_test1_child_pkey", ["id"], { unique: true })
@Entity("t_test1_child", { schema: "public" })
export class TTest1Child {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("character varying", {
    name: "comment",
    nullable: true,
    default: () => "''''''",
  })
  comment: string | null;

  @Column("timestamp with time zone", {
    name: "created_dt",
    nullable: true,
    default: () => "now()",
  })
  createdDt: Date | null;

  @ManyToOne(() => TTest1, (tTest1) => tTest1.tTest1Children, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "test1_id", referencedColumnName: "id" }])
  test1: TTest1;
}
