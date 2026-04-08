export abstract class SqlIndexBuilder {
  protected name: string;
  protected tableName: string;
  protected fields: string[] = [];
  protected unique: boolean = false;

  setName(name: string): this {
    this.name = name;
    return this;
  }

  setTableName(tableName: string): this {
    this.tableName = tableName;
    return this;
  }

  setFields(fields: string[]): this {
    this.fields = fields;
    return this;
  }

  setUnique(unique: boolean): this {
    this.unique = unique;
    return this;
  }

  build(): string {
    if (!this.name) throw new Error('Index name is required');
    if (!this.tableName) throw new Error('Index table name is required');
    if (this.fields.length === 0)
      throw new Error('Index must have at least one field');

    const uniqueClause = this.unique ? 'UNIQUE ' : '';
    return `CREATE ${uniqueClause}INDEX ${this.name} ON ${this.tableName} (${this.fields.join(', ')});`;
  }
}

export class PostgresIndexBuilder extends SqlIndexBuilder {}

export class MySQLIndexBuilder extends SqlIndexBuilder {}
