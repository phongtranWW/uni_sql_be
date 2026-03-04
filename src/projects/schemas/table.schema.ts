import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Field, FieldSchema } from './field.schema';

@Schema({ _id: false })
export class Table {
  @Prop({ required: true })
  name: string;

  @Prop({ type: [FieldSchema], default: [] })
  fields: Field[];

  @Prop({ required: true })
  headerColor: string;

  @Prop({ default: false })
  isSelected: boolean;

  @Prop({ type: String, default: null })
  alias: string | null;
}
export const TableSchema = SchemaFactory.createForClass(Table);
