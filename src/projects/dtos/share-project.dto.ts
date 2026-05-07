import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsDate,
  IsOptional,
  IsString,
  IsUUID,
  MinDate,
} from 'class-validator';

export class ShareProjectDto {
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsUUID('4', { each: true })
  @IsString({ each: true })
  userIds: string[];

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  @MinDate(() => new Date(), {
    message: 'expiresAt must be in the future',
  })
  expiresAt?: Date;
}
