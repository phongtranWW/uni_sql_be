import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Project, ProjectDocument } from './schemas/project.schema';
import { Model } from 'mongoose';
import { UpsertProjectDto } from './dtos/project-upsert.dto';

@Injectable()
export class ProjectService {
  constructor(
    @InjectModel(Project.name)
    private readonly projectModel: Model<ProjectDocument>,
  ) {}

  async getById(id: string, userId: string): Promise<ProjectDocument> {
    const project = await this.projectModel.findOne({ _id: id, userId }).exec();

    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async upsert(
    id: string,
    dto: UpsertProjectDto,
    userId: string,
  ): Promise<ProjectDocument> {
    return this.projectModel
      .findOneAndUpdate(
        { _id: id, userId },
        { $set: { ...dto, userId } },
        { upsert: true, returnDocument: 'after', runValidators: true },
      )
      .exec();
  }

  async deleteById(projectId: string, userId: string): Promise<void> {
    const result = await this.projectModel
      .findOneAndDelete({ _id: projectId, userId })
      .exec();

    if (!result) throw new NotFoundException('Project not found');
  }
}
