import { FieldType } from 'src/projects/schemas/field.schema';
import {
  SqlFieldBuilder,
  MySQLFieldBuilder,
  PostgresFieldBuilder,
} from './field.builder';

export abstract class SqlTableBuilder {
  protected name: string;
  protected builtFields: string[] = [];
  protected abstract fieldBuilderClass: new () => SqlFieldBuilder;

  setName(name: string): this {
    this.name = name;
    return this;
  }

  addField(
    name: string,
    type: FieldType,
    not_null?: boolean,
    unique?: boolean,
    pk?: boolean,
    increment?: boolean,
  ): this {
    const field = new this.fieldBuilderClass().setName(name).setType(type);

    if (not_null) field.setNotNull();
    if (unique) field.setUnique();
    if (pk) field.setPrimaryKey();
    if (increment) field.setAutoIncrement();

    this.builtFields.push(field.build());
    return this;
  }

  build(): string {
    if (!this.name) throw new Error('Table name is required');
    if (this.builtFields.length === 0)
      throw new Error('Table must have at least one field');
    return `CREATE TABLE ${this.name} (\n  ${this.builtFields.join(',\n  ')}\n);`;
  }
}

export class PostgresTableBuilder extends SqlTableBuilder {
  protected fieldBuilderClass = PostgresFieldBuilder;
}

export class MySQLTableBuilder extends SqlTableBuilder {
  protected fieldBuilderClass = MySQLFieldBuilder;
}
