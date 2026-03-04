import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class EndpointDto {
  @Expose()
  @IsString()
  @IsNotEmpty()
  tableName: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  fieldName: string;
}
