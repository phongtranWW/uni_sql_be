export enum ExportFormat {
  POSTGRESQL = 'postgresql',
  MYSQL = 'mysql',
}

export interface ExportProjectParams {
  format: ExportFormat;
}
