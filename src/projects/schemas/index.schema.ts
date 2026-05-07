import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class Index {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  tableName: string;

  @Prop({
    type: [String],
    required: true,
  })
  fields: string[];

  @Prop({ required: true })
  unique: boolean;
}

export const IndexSchema = SchemaFactory.createForClass(Index);
