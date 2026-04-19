import { Expose, Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { FieldDto } from './field.dto';

export class TablePositionDto {
  @Expose()
  @IsNumber()
  x: number;

  @Expose()
  @IsNumber()
  y: number;
}

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

  @Expose()
  @Transform(({ value }) => {
    if (
      value != null &&
      typeof value === 'object' &&
      typeof (value as { x?: unknown }).x === 'number' &&
      typeof (value as { y?: unknown }).y === 'number'
    ) {
      return {
        x: (value as { x: number }).x,
        y: (value as { y: number }).y,
      };
    }
    return { x: 0, y: 0 };
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => TablePositionDto)
  position?: TablePositionDto;
}
