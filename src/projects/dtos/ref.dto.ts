import { Expose, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';
import { EndpointDto } from './endpoint.dto';
import { RefOperator } from '../schemas/ref.schema';

export class RefDto {
  @Expose()
  @IsString()
  @IsNotEmpty()
  name: string;

  @Expose()
  @IsBoolean()
  isSelected: boolean;

  @Expose()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EndpointDto)
  endpoints: [EndpointDto, EndpointDto];

  @Expose()
  @IsEnum(RefOperator)
  operator: RefOperator;
}
