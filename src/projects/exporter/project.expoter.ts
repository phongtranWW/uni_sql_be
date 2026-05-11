import { exporter } from '@dbml/core';
import { ProjectDocument } from '../schemas/project.schema';
import { DbmlBuilder, DbmlDialect } from './dbml.builder';

export class ProjectExporter {
  constructor(private readonly project: ProjectDocument) {}

  toPostgresql(): string {
    return this.toSql('postgres');
  }

  toMysql(): string {
    return this.toSql('mysql');
  }

  toDbml(): string {
    return new DbmlBuilder(this.project, 'dbml').build();
  }

  toJson(): string {
    return JSON.stringify(
      {
        id: this.project._id,
        name: this.project.name,
        tables: this.project.tables.map((table) => ({
          name: table.name,
          fields: table.fields.map((field) => ({
            name: field.name,
            type: field.type,
            not_null: field.not_null,
            unique: field.unique,
            pk: field.pk,
            increment: field.increment,
            default: field.default,
          })),
        })),
        refs: this.project.refs.map((ref) => ({
          name: ref.name,
          operator: ref.operator,
          endpoints: ref.endpoints,
        })),
        indexes: this.project.indexes.map((index) => ({
          name: index.name,
          tableName: index.tableName,
          fields: index.fields,
          unique: index.unique,
        })),
      },
      null,
      2,
    );
  }

  private toSql(dialect: Extract<DbmlDialect, 'postgres' | 'mysql'>): string {
    if (!this.project.tables || this.project.tables.length === 0) {
      return this.buildCreateDatabaseHeader();
    }

    const dbml = new DbmlBuilder(this.project, dialect).build();
    const sql = exporter.export(dbml, dialect);
    return `${this.buildCreateDatabaseHeader()}${sql}`;
  }

  private buildCreateDatabaseHeader(): string {
    const name = this.project.name;
    if (!name) return '';
    return [
      '-- NOTE: The CREATE DATABASE statement below is commented out.',
      '-- Please create the database manually before running this script, or uncomment the line below to create it.',
      `-- CREATE DATABASE ${name};`,
      '',
      '',
    ].join('\n');
  }
}
