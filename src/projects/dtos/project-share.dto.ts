import { Expose, Type } from 'class-transformer';

export class SharedUserDto {
  @Expose()
  id: string;

  @Expose()
  email: string;

  @Expose()
  name?: string;

  @Expose()
  avatar?: string;
}

export class ProjectShareDto {
  @Expose()
  userId: string;

  @Expose()
  expiresAt: Date | null;

  @Expose()
  createdAt: Date;

  @Expose()
  @Type(() => SharedUserDto)
  user?: SharedUserDto;
}
