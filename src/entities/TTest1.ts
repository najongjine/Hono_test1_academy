import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { TTest1Child } from "./TTest1Child";

@Index("t_test1_pkey", ["id"], { unique: true })
@Entity("t_test1", { schema: "public" })
export class TTest1 {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("character varying", {
    name: "title",
    nullable: true,
    default: () => "''''''",
  })
  title: string | null;

  @Column("character varying", {
    name: "content",
    nullable: true,
    default: () => "''''''",
  })
  content: string | null;

  @Column("timestamp with time zone", {
    name: "created_dt",
    nullable: true,
    default: () => "now()",
  })
  createdDt: Date | null;

  @OneToMany(() => TTest1Child, (tTest1Child) => tTest1Child.test1)
  tTest1Children: TTest1Child[];
}
