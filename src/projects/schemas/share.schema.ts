import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false, timestamps: { createdAt: true, updatedAt: false } })
export class ProjectShare {
  @Prop({ required: true })
  userId: string;

  @Prop({ type: Date, default: null })
  expiresAt: Date | null;

  createdAt: Date;
}

export const ProjectShareSchema = SchemaFactory.createForClass(ProjectShare);
