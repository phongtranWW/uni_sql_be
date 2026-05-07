import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Table, TableSchema } from './table.schema';
import { Ref, RefSchema } from './ref.schema';
import { Index, IndexSchema } from './index.schema';
import { ProjectShare, ProjectShareSchema } from './share.schema';

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

  @Prop({ type: [IndexSchema], default: [] })
  indexes: Index[];

  @Prop({ type: [ProjectShareSchema], default: [] })
  shares: ProjectShare[];
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
