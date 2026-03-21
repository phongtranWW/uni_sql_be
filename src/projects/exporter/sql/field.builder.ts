import { FieldType } from 'src/projects/schemas/field.schema';

export abstract class SqlFieldBuilder {
  protected name: string = '';
  protected type: FieldType = FieldType.VARCHAR;
  protected notNull: boolean = false;
  protected unique: boolean = false;
  protected pk: boolean = false;
  protected increment: boolean = false;

  protected abstract typeMap: Record<FieldType, string>;
  protected abstract autoIncrementClause: string;

  setName(name: string): this {
    this.name = name;
    return this;
  }
  setType(type: FieldType): this {
    this.type = type;
    return this;
  }
  setNotNull(): this {
    this.notNull = true;
    return this;
  }
  setUnique(): this {
    this.unique = true;
    return this;
  }
  setPrimaryKey(): this {
    this.pk = true;
    return this;
  }
  setAutoIncrement(): this {
    this.increment = true;
    return this;
  }

  build(): string {
    if (!this.name) throw new Error('name is required');
    if (!this.type) throw new Error('type is required');
    const parts = [this.name, this.typeMap[this.type]];

    if (this.pk) parts.push('PRIMARY KEY');
    if (this.increment) parts.push(this.autoIncrementClause);
    if (this.unique && !this.pk) parts.push('UNIQUE');
    parts.push(this.notNull ? 'NOT NULL' : 'NULL');

    return parts.join(' ');
  }
}

export class PostgresFieldBuilder extends SqlFieldBuilder {
  protected autoIncrementClause = 'GENERATED ALWAYS AS IDENTITY';
  protected typeMap: Record<FieldType, string> = {
    [FieldType.INT]: 'INTEGER',
    [FieldType.FLOAT]: 'REAL',
    [FieldType.DOUBLE]: 'DOUBLE PRECISION',
    [FieldType.DECIMAL]: 'NUMERIC',
    [FieldType.CHAR]: 'CHAR',
    [FieldType.VARCHAR]: 'VARCHAR',
    [FieldType.TEXT]: 'TEXT',
    [FieldType.BOOLEAN]: 'BOOLEAN',
    [FieldType.DATE]: 'DATE',
    [FieldType.TIME]: 'TIME',
    [FieldType.DATETIME]: 'TIMESTAMP',
    [FieldType.TIMESTAMP]: 'TIMESTAMPTZ',
    [FieldType.UUID]: 'UUID',
  };
}

export class MySQLFieldBuilder extends SqlFieldBuilder {
  protected autoIncrementClause = 'AUTO_INCREMENT';
  protected typeMap: Record<FieldType, string> = {
    [FieldType.INT]: 'INT',
    [FieldType.FLOAT]: 'FLOAT',
    [FieldType.DOUBLE]: 'DOUBLE',
    [FieldType.DECIMAL]: 'DECIMAL',
    [FieldType.CHAR]: 'CHAR',
    [FieldType.VARCHAR]: 'VARCHAR(255)',
    [FieldType.TEXT]: 'TEXT',
    [FieldType.BOOLEAN]: 'TINYINT(1)',
    [FieldType.DATE]: 'DATE',
    [FieldType.TIME]: 'TIME',
    [FieldType.DATETIME]: 'DATETIME',
    [FieldType.TIMESTAMP]: 'TIMESTAMP',
    [FieldType.UUID]: 'CHAR(36)',
  };
}
