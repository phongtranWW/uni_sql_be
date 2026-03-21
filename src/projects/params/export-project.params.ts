export enum ExportFormat {
  POSTGRESQL = 'postgresql',
  MYSQL = 'mysql',
  JSON = 'json',
}

export interface ExportProjectParams {
  format: ExportFormat;
}
