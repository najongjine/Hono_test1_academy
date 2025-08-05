import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Index("t_files_pkey", ["id"], { unique: true })
@Entity("t_files", { schema: "public" })
export class TFiles {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("character varying", {
    name: "original_name",
    nullable: true,
    default: () => "''",
  })
  originalName: string | null;

  @Column("character varying", {
    name: "stored_name",
    nullable: true,
    default: () => "''",
  })
  storedName: string | null;

  @Column("character varying", {
    name: "file_path",
    nullable: true,
    default: () => "''",
  })
  filePath: string | null;

  @Column("character varying", {
    name: "mime_type",
    nullable: true,
    default: () => "''",
  })
  mimeType: string | null;

  @Column("bigint", { name: "file_size", nullable: true, default: () => "0" })
  fileSize: string | null;

  @Column("timestamp without time zone", {
    name: "created_at",
    nullable: true,
    default: () => "now()",
  })
  createdAt: Date | null;
}
