import 'dotenv/config';
import { DataSource } from 'typeorm';

/**
 * TypeORM DataSource configuration for CLI commands (migrations).
 * This file is used by the TypeORM CLI to run migrations.
 *
 * Usage:
 *   npx typeorm-ts-node-commonjs migration:generate src/migrations/MigrationName -d src/config/typeorm.datasource.ts
 *   npx typeorm-ts-node-commonjs migration:run -d src/config/typeorm.datasource.ts
 *   npx typeorm-ts-node-commonjs migration:revert -d src/config/typeorm.datasource.ts
 */
export default new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT!, 10),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  ssl:
    process.env.POSTGRES_SSL === 'true' ? { rejectUnauthorized: false } : false,
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/migrations/*.ts'],
});
