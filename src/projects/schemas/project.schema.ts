import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Table, TableSchema } from './table.schema';
import { Ref, RefSchema } from './ref.schema';

export type ProjectDocument = HydratedDocument<Project>;
@Schema({ timestamps: true })
export class Project {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ type: [TableSchema], default: [] })
  tables: Table[];

  @Prop({ type: [RefSchema], default: [] })
  refs: Ref[];
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
