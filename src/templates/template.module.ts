import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { Template } from './entities/template.entity';
import { Project, ProjectSchema } from '../projects/schemas/project.schema';
import { TemplateService } from './template.service';
import { TemplateController } from './template.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Template]),
    MongooseModule.forFeature([{ name: Project.name, schema: ProjectSchema }]),
  ],
  controllers: [TemplateController],
  providers: [TemplateService],
})
export class TemplateModule {}
