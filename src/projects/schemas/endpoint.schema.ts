import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class Endpoint {
  @Prop({ required: true })
  tableName: string;

  @Prop({ required: true })
  fieldName: string;
}
export const EndpointSchema = SchemaFactory.createForClass(Endpoint);
