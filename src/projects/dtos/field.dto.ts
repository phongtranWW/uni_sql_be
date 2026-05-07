import { Expose } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { FieldType } from '../schemas/field.schema';

export class FieldDto {
  @Expose()
  @IsString()
  @IsNotEmpty()
  name: string;

  @Expose()
  @IsEnum(FieldType)
  type: FieldType;

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

  @Expose()
  @IsOptional()
  @IsString()
  default: string | null = null;
}
