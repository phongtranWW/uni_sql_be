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

  @Prop({ type: { x: Number, y: Number }, default: { x: 0, y: 0 }, _id: false })
  position: {
    x: number;
    y: number;
  };
}
export const TableSchema = SchemaFactory.createForClass(Table);
