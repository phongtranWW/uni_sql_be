import {
  MySQLRefBuilder,
  PostgresRefBuilder,
  SqlRefBuilder,
} from './ref.builder';
import {
  MySQLTableBuilder,
  PostgresTableBuilder,
  SqlTableBuilder,
} from './table.builder';

export abstract class DatabaseBuilder {
  protected name: string = '';
  protected tableBuilders: SqlTableBuilder[] = [];
  protected refBuilders: SqlRefBuilder[] = [];

  protected abstract tableBuilderClass: new () => SqlTableBuilder;
  protected abstract refBuilderClass: new () => SqlRefBuilder;

  setName(name: string): this {
    this.name = name;
    return this;
  }

  addTable(fn: (builder: SqlTableBuilder) => SqlTableBuilder): this {
    const table = fn(new this.tableBuilderClass());
    this.tableBuilders.push(table);
    return this;
  }

  addRef(fn: (builder: SqlRefBuilder) => SqlRefBuilder): this {
    const ref = fn(new this.refBuilderClass());
    this.refBuilders.push(ref);
    return this;
  }

  build(): string {
    const createDatabase = this.name ? `CREATE DATABASE ${this.name};\n\n` : '';
    const tables = this.tableBuilders.map((t) => t.build()).join('\n\n');
    const refs =
      this.refBuilders.length > 0
        ? '\n\n' + this.refBuilders.map((r) => r.build()).join('\n')
        : '';

    return `${createDatabase}${tables}${refs}`;
  }
}

export class PostgresDatabaseBuilder extends DatabaseBuilder {
  protected tableBuilderClass = PostgresTableBuilder;
  protected refBuilderClass = PostgresRefBuilder;
}

export class MySQLDatabaseBuilder extends DatabaseBuilder {
  protected tableBuilderClass = MySQLTableBuilder;
  protected refBuilderClass = MySQLRefBuilder;
}
