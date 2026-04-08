import { Expose, Transform, Type } from 'class-transformer';
import { TableDto } from './table.dto';
import { RefDto } from './ref.dto';
import { Types } from 'mongoose';
import { IndexDto } from './index.dto';

export class ProjectDto {
  @Expose()
  @Transform(({ obj }: { obj: { _id: Types.ObjectId } }) => obj._id.toString())
  id: string;

  @Expose()
  name: string;

  @Expose()
  @Type(() => TableDto)
  tables: TableDto[];

  @Expose()
  @Type(() => RefDto)
  refs: RefDto[];

  @Expose()
  @Type(() => IndexDto)
  indexes: IndexDto[];

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
