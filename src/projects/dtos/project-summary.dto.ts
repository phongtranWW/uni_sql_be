import { Expose, Transform } from 'class-transformer';
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
}
