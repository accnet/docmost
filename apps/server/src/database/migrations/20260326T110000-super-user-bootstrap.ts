import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('users')
    .addColumn('registration_source', 'varchar', (col) =>
      col.notNull().defaultTo('invite'),
    )
    .addColumn('is_super_user', 'boolean', (col) =>
      col.notNull().defaultTo(false),
    )
    .execute();

  await db
    .updateTable('users')
    .set({
      registration_source: sql`case
        when "users"."role" = 'owner' and "users"."workspace_id" is not null then 'register'
        else 'invite'
      end`,
    })
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('users')
    .dropColumn('is_super_user')
    .dropColumn('registration_source')
    .execute();
}
