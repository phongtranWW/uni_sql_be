import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class Field {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  type: string;

  @Prop({ default: false })
  unique: boolean;

  @Prop({ default: false })
  pk: boolean;

  @Prop({ default: false })
  not_null: boolean;

  @Prop({ default: false })
  increment: boolean;
}
export const FieldSchema = SchemaFactory.createForClass(Field);
