import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export enum FieldType {
  INT = 'INT',
  FLOAT = 'FLOAT',
  DOUBLE = 'DOUBLE',
  DECIMAL = 'DECIMAL',
  CHAR = 'CHAR',
  VARCHAR = 'VARCHAR',
  TEXT = 'TEXT',
  BOOLEAN = 'BOOLEAN',
  DATE = 'DATE',
  TIME = 'TIME',
  DATETIME = 'DATETIME',
  TIMESTAMP = 'TIMESTAMP',
  UUID = 'UUID',
}

@Schema({ _id: false })
export class Field {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  type: FieldType;

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
