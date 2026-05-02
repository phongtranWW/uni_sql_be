import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1777708212579 implements MigrationInterface {
  name = 'Init1777708212579';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create templates table
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "templates" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "image" text,
        "name" character varying NOT NULL,
        "description" text,
        "projectId" character varying NOT NULL,
        "authorId" uuid NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_515948649ce0bbbe391de702ae5" PRIMARY KEY ("id")
      )`,
    );

    // 2. Create the enum type if it doesn't exist
    await queryRunner.query(
      `DO $$
       BEGIN
         IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'oauth_accounts_provider_enum') THEN
           CREATE TYPE "public"."oauth_accounts_provider_enum" AS ENUM('google', 'github');
         END IF;
       END$$`,
    );

    // 3. Convert provider column from varchar to enum (preserving data)
    const hasProviderColumn = await queryRunner.query(
      `SELECT column_name, data_type FROM information_schema.columns
       WHERE table_name = 'oauth_accounts' AND column_name = 'provider'`,
    );

    if (hasProviderColumn.length > 0 && hasProviderColumn[0].data_type === 'character varying') {
      await queryRunner.query(
        `ALTER TABLE "oauth_accounts"
         ALTER COLUMN "provider" TYPE "public"."oauth_accounts_provider_enum"
         USING "provider"::"public"."oauth_accounts_provider_enum"`,
      );
    }

    // 4. Drop legacy columns if they exist
    const columns = await queryRunner.query(
      `SELECT column_name FROM information_schema.columns
       WHERE table_name = 'oauth_accounts' AND column_name IN ('access_token', 'refresh_token')`,
    );
    for (const col of columns) {
      await queryRunner.query(
        `ALTER TABLE "oauth_accounts" DROP COLUMN IF EXISTS "${col.column_name}"`,
      );
    }

    // 5. Drop old constraints and re-create with TypeORM-managed names
    // Unique constraint
    await queryRunner.query(
      `ALTER TABLE "oauth_accounts" DROP CONSTRAINT IF EXISTS "oauth_accounts_provider_provider_id_key"`,
    );
    await queryRunner.query(
      `DO $$
       BEGIN
         IF NOT EXISTS (
           SELECT 1 FROM pg_constraint WHERE conname = 'UQ_283c974372e384adfc2c51ae180'
         ) THEN
           ALTER TABLE "oauth_accounts"
             ADD CONSTRAINT "UQ_283c974372e384adfc2c51ae180" UNIQUE ("provider", "provider_id");
         END IF;
       END$$`,
    );

    // Foreign key on oauth_accounts
    await queryRunner.query(
      `ALTER TABLE "oauth_accounts" DROP CONSTRAINT IF EXISTS "oauth_accounts_user_id_fkey"`,
    );
    await queryRunner.query(
      `DO $$
       BEGIN
         IF NOT EXISTS (
           SELECT 1 FROM pg_constraint WHERE conname = 'FK_22a05e92f51a983475f9281d3b0'
         ) THEN
           ALTER TABLE "oauth_accounts"
             ADD CONSTRAINT "FK_22a05e92f51a983475f9281d3b0"
             FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
         END IF;
       END$$`,
    );

    // Foreign key on templates
    await queryRunner.query(
      `DO $$
       BEGIN
         IF NOT EXISTS (
           SELECT 1 FROM pg_constraint WHERE conname = 'FK_04a6649a4b4ef5b5be1bd9a7e52'
         ) THEN
           ALTER TABLE "templates"
             ADD CONSTRAINT "FK_04a6649a4b4ef5b5be1bd9a7e52"
             FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
         END IF;
       END$$`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "templates" DROP CONSTRAINT IF EXISTS "FK_04a6649a4b4ef5b5be1bd9a7e52"`,
    );
    await queryRunner.query(
      `ALTER TABLE "oauth_accounts" DROP CONSTRAINT IF EXISTS "FK_22a05e92f51a983475f9281d3b0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "oauth_accounts" DROP CONSTRAINT IF EXISTS "UQ_283c974372e384adfc2c51ae180"`,
    );

    // Convert provider back to varchar
    await queryRunner.query(
      `ALTER TABLE "oauth_accounts"
       ALTER COLUMN "provider" TYPE character varying(20)
       USING "provider"::text`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."oauth_accounts_provider_enum"`,
    );

    // Re-add legacy columns
    await queryRunner.query(
      `ALTER TABLE "oauth_accounts" ADD COLUMN IF NOT EXISTS "access_token" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "oauth_accounts" ADD COLUMN IF NOT EXISTS "refresh_token" text`,
    );

    // Drop templates table
    await queryRunner.query(`DROP TABLE IF EXISTS "templates"`);

    // Restore old constraints
    await queryRunner.query(
      `ALTER TABLE "oauth_accounts"
       ADD CONSTRAINT "oauth_accounts_provider_provider_id_key" UNIQUE ("provider", "provider_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "oauth_accounts"
       ADD CONSTRAINT "oauth_accounts_user_id_fkey"
       FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
