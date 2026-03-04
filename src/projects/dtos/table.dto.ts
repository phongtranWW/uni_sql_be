import { Expose, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { FieldDto } from './field.dto';

export class TableDto {
  @Expose()
  @IsString()
  @IsNotEmpty()
  name: string;

  @Expose()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FieldDto)
  fields: FieldDto[];

  @Expose()
  @IsString()
  @IsNotEmpty()
  headerColor: string;

  @Expose()
  @IsBoolean()
  isSelected: boolean;

  @Expose()
  @IsOptional()
  @IsString()
  alias: string | null;
}
