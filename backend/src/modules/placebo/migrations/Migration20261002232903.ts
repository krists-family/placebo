import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20261002232903 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "placebo_record" drop constraint if exists "placebo_record_key_unique";`);
    this.addSql(`create table if not exists "placebo_record" ("id" text not null, "kind" text not null, "key" text not null, "payload" jsonb not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "placebo_record_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_placebo_record_key_unique" ON "placebo_record" ("key") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_placebo_record_deleted_at" ON "placebo_record" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "placebo_record" cascade;`);
  }

}
