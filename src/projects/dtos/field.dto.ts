import { Expose } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class FieldDto {
  @Expose()
  @IsString()
  @IsNotEmpty()
  name: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  type: string;

  @Expose()
  @IsBoolean()
  unique: boolean;

  @Expose()
  @IsBoolean()
  pk: boolean;

  @Expose()
  @IsBoolean()
  not_null: boolean;

  @Expose()
  @IsBoolean()
  increment: boolean;
}
