/**
 * Project-related DTOs defined locally in the templates module
 * to avoid cross-module imports from the projects module.
 *
 * These mirror the project DTOs structure.
 */

// ── Enums ──────────────────────────────────────────────

export enum RefOperator {
  ONE_TO_ONE = '-',
  MANY_TO_ONE = '>',
  ONE_TO_MANY = '<',
}

// ── Sub-types ──────────────────────────────────────────

export class TemplateProjectFieldDto {
  name: string;
  type: string;
  unique: boolean;
  pk: boolean;
  not_null: boolean;
  increment: boolean;
  default: string | null;
}

export class TemplateProjectPositionDto {
  x: number;
  y: number;
}

export class TemplateProjectTableDto {
  name: string;
  fields: TemplateProjectFieldDto[];
  headerColor: string;
  isSelected: boolean;
  alias: string | null;
  position: TemplateProjectPositionDto;
}

export class TemplateProjectEndpointDto {
  tableName: string;
  fieldName: string;
}

export class TemplateProjectRefDto {
  name: string;
  isSelected: boolean;
  endpoints: [TemplateProjectEndpointDto, TemplateProjectEndpointDto];
  operator: RefOperator;
}

export class TemplateProjectIndexDto {
  name: string;
  tableName: string;
  fields: string[];
  unique: boolean;
}

// ── Main project DTO ───────────────────────────────────

export class TemplateProjectDto {
  id: string;
  name: string;
  tables: TemplateProjectTableDto[];
  refs: TemplateProjectRefDto[];
  indexes: TemplateProjectIndexDto[];
  createdAt: Date;
  updatedAt: Date;
}
