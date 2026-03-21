import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Endpoint, EndpointSchema } from './endpoint.schema';

export enum RefOperator {
  ONE_TO_ONE = '-',
  MANY_TO_ONE = '>',
  ONE_TO_MANY = '<',
}

@Schema({ _id: false })
export class Ref {
  @Prop({ required: true })
  name: string;

  @Prop({ default: false })
  isSelected: boolean;

  @Prop({ type: [EndpointSchema], required: true })
  endpoints: [Endpoint, Endpoint];

  @Prop({ required: true, enum: ['-', '>', '<'] })
  operator: RefOperator;
}
export const RefSchema = SchemaFactory.createForClass(Ref);
