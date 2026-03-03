import { IsEnum, IsOptional, IsString, IsEmail } from 'class-validator';
import { OAuthProvider } from '../entities/oauth-account.entity';

export class OAuthProfileDto {
  @IsEnum(OAuthProvider)
  provider: OAuthProvider;

  @IsString()
  providerId: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  avatar?: string;
}
