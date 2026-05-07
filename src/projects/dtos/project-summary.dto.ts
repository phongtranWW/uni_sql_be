import { Expose, Transform, Type } from 'class-transformer';
import { Types } from 'mongoose';

export class ProjectSummaryDto {
  @Expose()
  @Transform(({ obj }: { obj: { _id: Types.ObjectId } }) => obj._id.toString())
  id: string;

  @Expose()
  name: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  @Type(() => SharedUserSummaryDto)
  sharedUsers?: SharedUserSummaryDto[];
}

export class SharedUserSummaryDto {
  @Expose()
  id: string;

  @Expose()
  name?: string;

  @Expose()
  avatar?: string;
}
