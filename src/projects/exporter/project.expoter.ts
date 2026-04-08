import { ProjectDocument } from '../schemas/project.schema';
import {
  MySQLDatabaseBuilder,
  PostgresDatabaseBuilder,
} from './sql/database.builder';
export class ProjectExporter {
  constructor(private readonly project: ProjectDocument) {}

  toPostgresql(): string {
    const builder = new PostgresDatabaseBuilder();
    builder.setName(this.project.name);
    for (const table of this.project.tables) {
      builder.addTable((t) => {
        t.setName(table.name);
        for (const field of table.fields) {
          t.addField(
            field.name,
            field.type,
            field.not_null,
            field.unique,
            field.pk,
            field.increment,
          );
        }
        return t;
      });
    }

    for (const ref of this.project.refs) {
      builder.addRef((r) =>
        r
          .setName(ref.name)
          .setEndpoints(ref.endpoints)
          .setOperator(ref.operator),
      );
    }

    for (const index of this.project.indexes) {
      builder.addIndex((i) =>
        i
          .setName(index.name)
          .setTableName(index.tableName)
          .setFields(index.fields)
          .setUnique(index.unique),
      );
    }

    return builder.build();
  }

  toMysql(): string {
    const builder = new MySQLDatabaseBuilder();
    builder.setName(this.project.name);
    for (const table of this.project.tables) {
      builder.addTable((t) => {
        t.setName(table.name);
        for (const field of table.fields) {
          t.addField(
            field.name,
            field.type,
            field.not_null,
            field.unique,
            field.pk,
            field.increment,
          );
        }
        return t;
      });
    }

    for (const ref of this.project.refs) {
      builder.addRef((r) =>
        r
          .setName(ref.name)
          .setEndpoints(ref.endpoints)
          .setOperator(ref.operator),
      );
    }

    for (const index of this.project.indexes) {
      builder.addIndex((i) =>
        i
          .setName(index.name)
          .setTableName(index.tableName)
          .setFields(index.fields)
          .setUnique(index.unique),
      );
    }

    return builder.build();
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
}
