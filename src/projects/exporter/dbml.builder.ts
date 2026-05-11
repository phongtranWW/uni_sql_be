import { Field } from '../schemas/field.schema';
import { Index as ProjectIndex } from '../schemas/index.schema';
import { ProjectDocument } from '../schemas/project.schema';
import { Ref } from '../schemas/ref.schema';
import { Table } from '../schemas/table.schema';

export type DbmlDialect = 'postgres' | 'mysql' | 'dbml';

const IDENTIFIER_REGEX = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

type ProjectLike = Pick<
  ProjectDocument,
  'name' | 'tables' | 'refs' | 'indexes'
>;

export class DbmlBuilder {
  constructor(
    private readonly project: ProjectLike,
    private readonly dialect: DbmlDialect = 'dbml',
  ) {}

  build(): string {
    const sections: string[] = [];

    const projectBlock = this.buildProjectBlock();
    if (projectBlock) sections.push(projectBlock);

    const indexesByTable = this.groupIndexesByTable();
    for (const table of this.project.tables ?? []) {
      sections.push(
        this.buildTable(table, indexesByTable.get(table.name) ?? []),
      );
    }

    for (const ref of this.project.refs ?? []) {
      sections.push(this.buildRef(ref));
    }

    return sections.join('\n\n') + '\n';
  }

  private buildProjectBlock(): string {
    const databaseType =
      this.dialect === 'mysql'
        ? 'MySQL'
        : this.dialect === 'postgres'
          ? 'PostgreSQL'
          : 'Generic';

    const safeName = this.sanitizeProjectName(this.project.name);
    return `Project ${safeName} {\n  database_type: '${databaseType}'\n}`;
  }

  private groupIndexesByTable(): Map<string, ProjectIndex[]> {
    const grouped = new Map<string, ProjectIndex[]>();
    for (const index of this.project.indexes ?? []) {
      const arr = grouped.get(index.tableName) ?? [];
      arr.push(index);
      grouped.set(index.tableName, arr);
    }
    return grouped;
  }

  private buildTable(table: Table, tableIndexes: ProjectIndex[]): string {
    const fields = table.fields ?? [];
    const pkFields = fields.filter((f) => f.pk);
    const isCompositePk = pkFields.length > 1;

    const lines: string[] = [];
    lines.push(`Table ${this.escapeIdentifier(table.name)} {`);

    for (const field of fields) {
      lines.push(`  ${this.buildField(field, isCompositePk)}`);
    }

    const indexLines: string[] = [];
    if (isCompositePk) {
      const pkCols = pkFields
        .map((f) => this.escapeIdentifier(f.name))
        .join(', ');
      indexLines.push(`    (${pkCols}) [pk]`);
    }
    for (const index of tableIndexes) {
      const built = this.buildIndex(index);
      if (built) indexLines.push(`    ${built}`);
    }

    if (indexLines.length > 0) {
      lines.push('');
      lines.push('  indexes {');
      lines.push(...indexLines);
      lines.push('  }');
    }

    lines.push('}');
    return lines.join('\n');
  }

  private buildField(field: Field, isCompositePk: boolean): string {
    const settings: string[] = [];
    if (field.pk && !isCompositePk) settings.push('pk');
    if (field.increment) settings.push('increment');
    if (field.unique && !field.pk) settings.push('unique');
    if (field.not_null) settings.push('not null');
    if (
      field.default !== undefined &&
      field.default !== null &&
      String(field.default).trim() !== ''
    ) {
      settings.push(`default: ${this.formatDefault(String(field.default))}`);
    }

    const settingsStr = settings.length > 0 ? ` [${settings.join(', ')}]` : '';
    return `${this.escapeIdentifier(field.name)} ${field.type}${settingsStr}`;
  }

  private buildIndex(index: ProjectIndex): string {
    const fields = (index.fields ?? []).map((f) => this.escapeIdentifier(f));
    if (fields.length === 0) return '';

    const target = fields.length === 1 ? fields[0] : `(${fields.join(', ')})`;

    const settings: string[] = [];
    if (index.unique) settings.push('unique');
    if (index.name) {
      settings.push(`name: '${this.escapeSingleQuoted(index.name)}'`);
    }

    const settingsStr = settings.length > 0 ? ` [${settings.join(', ')}]` : '';
    return `${target}${settingsStr}`;
  }

  private buildRef(ref: Ref): string {
    if (!ref.endpoints || ref.endpoints.length !== 2) return '';

    const [from, to] = ref.endpoints;
    const fromQ = `${this.escapeIdentifier(from.tableName)}.${this.escapeIdentifier(from.fieldName)}`;
    const toQ = `${this.escapeIdentifier(to.tableName)}.${this.escapeIdentifier(to.fieldName)}`;
    const namePart = ref.name ? ` ${this.escapeIdentifier(ref.name)}` : '';

    // DBML semantics for ref form (the symbol decides FK side):
    //   A > B  -> A is FK referencing B (Many-to-One)
    //   A < B  -> B is FK referencing A (One-to-Many)
    //   A - B  -> B is FK referencing A (One-to-One)
    //
    // As long as the FE passes the endpoints in the correct order corresponding
    // to the operator, we can directly emit it.
    return `Ref${namePart}: ${fromQ} ${ref.operator} ${toQ}`;
  }

  private formatDefault(rawValue: string): string {
    const value = rawValue.trim();
    if (value === '') return `''`;

    const lower = value.toLowerCase();
    if (lower === 'null') return 'null';
    if (lower === 'true' || lower === 'false') return lower;

    if (/^-?\d+(\.\d+)?$/.test(value)) return value;

    if (/^'.*'$/.test(value) && !value.includes('`')) return value;
    if (/^`.*`$/.test(value)) return value;

    return '`' + value.replace(/`/g, '\\`') + '`';
  }

  private escapeIdentifier(name: string): string {
    if (IDENTIFIER_REGEX.test(name)) return name;
    return `"${name.replace(/"/g, '\\"')}"`;
  }

  private sanitizeProjectName(name: string): string {
    if (!name) return 'project';
    if (IDENTIFIER_REGEX.test(name)) return name;
    const sanitized = name.replace(/[^a-zA-Z0-9_]/g, '_');
    return IDENTIFIER_REGEX.test(sanitized) ? sanitized : `_${sanitized}`;
  }

  private escapeSingleQuoted(value: string): string {
    return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  }
}
