import { Expose, plainToInstance } from 'class-transformer';

export class ExportResultDto {
  @Expose()
  content: string;

  @Expose()
  format: string;

  static from(content: string, format: string): ExportResultDto {
    return plainToInstance(
      ExportResultDto,
      { content, format },
      {
        excludeExtraneousValues: true,
      },
    );
  }
}
