import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { TableDto } from './table.dto';
import { RefDto } from './ref.dto';
import { IndexDto } from './index.dto';

export class UpsertProjectDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TableDto)
  tables: TableDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RefDto)
  refs: RefDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => IndexDto)
  indexes: IndexDto[];
}
