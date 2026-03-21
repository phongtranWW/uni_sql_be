import { Endpoint } from 'src/projects/schemas/endpoint.schema';
import { RefOperator } from 'src/projects/schemas/ref.schema';

export abstract class SqlRefBuilder {
  protected name: string;
  protected endpoints: [Endpoint, Endpoint];
  protected operator: RefOperator;

  setName(name: string): this {
    this.name = name;
    return this;
  }

  setEndpoints(endpoints: [Endpoint, Endpoint]): this {
    this.endpoints = endpoints;
    return this;
  }

  setOperator(operator: RefOperator): this {
    this.operator = operator;
    return this;
  }

  protected buildForeignKey(from: Endpoint, to: Endpoint): string {
    return `ALTER TABLE ${from.tableName} ADD CONSTRAINT ${this.name} FOREIGN KEY (${from.fieldName}) REFERENCES ${to.tableName}(${to.fieldName});`;
  }

  protected abstract buildUniqueConstraint(
    table: string,
    field: string,
  ): string;

  build(): string {
    if (!this.name) throw new Error('Ref name is required');
    if (this.endpoints.length !== 2)
      throw new Error('Ref must have two endpoints');
    const [from, to] = this.endpoints;

    switch (this.operator) {
      case RefOperator.ONE_TO_ONE:
        return [
          this.buildForeignKey(from, to),
          this.buildUniqueConstraint(from.tableName, from.fieldName),
        ].join('\n');

      case RefOperator.MANY_TO_ONE:
        return this.buildForeignKey(from, to);

      case RefOperator.ONE_TO_MANY:
        return this.buildForeignKey(to, from);
    }
  }
}

export class PostgresRefBuilder extends SqlRefBuilder {
  protected buildUniqueConstraint(table: string, field: string): string {
    return `ALTER TABLE ${table} ADD CONSTRAINT uq_${this.name} UNIQUE (${field});`;
  }
}

export class MySQLRefBuilder extends SqlRefBuilder {
  protected buildUniqueConstraint(table: string, field: string): string {
    return `ALTER TABLE ${table} ADD UNIQUE uq_${this.name} (${field});`;
  }
}
