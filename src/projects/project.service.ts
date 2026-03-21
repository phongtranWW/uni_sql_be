import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Project, ProjectDocument } from './schemas/project.schema';
import { Model } from 'mongoose';
import { UpsertProjectDto } from './dtos/project-upsert.dto';
import { GetManyProjectsParams } from './params/get-many-projects.params';
import { ResponsePagination } from 'src/common/types/response-pagination.type';
import { ProjectSummaryDto } from './dtos/project-summary.dto';
import { plainToInstance } from 'class-transformer';
import {
  ExportFormat,
  ExportProjectParams,
} from './params/export-project.params';
import { ProjectExporter } from './exporter/project.expoter';
import { ExportResultDto } from './dtos/export-result.dto';

@Injectable()
export class ProjectService {
  constructor(
    @InjectModel(Project.name)
    private readonly projectModel: Model<ProjectDocument>,
  ) {}

  async getOneById(id: string, userId: string): Promise<ProjectDocument> {
    const project = await this.projectModel.findOne({ _id: id, userId }).exec();

    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async getManyBy(
    userId: string,
    params: GetManyProjectsParams,
  ): Promise<ResponsePagination<ProjectSummaryDto>> {
    const { search, page, limit, sortBy, sortOrder } = params;

    const filter: Record<string, unknown> = { userId };

    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 } as Record<
      string,
      1 | -1
    >;
    const [docs, total] = await Promise.all([
      this.projectModel.find(filter).sort(sort).skip(skip).limit(limit).exec(),
      this.projectModel.countDocuments(filter).exec(),
    ]);

    return {
      data: plainToInstance(ProjectSummaryDto, docs, {
        excludeExtraneousValues: true,
      }),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
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

  async export(
    id: string,
    userId: string,
    params: ExportProjectParams,
  ): Promise<ExportResultDto> {
    const project = await this.projectModel.findOne({ _id: id, userId }).exec();
    if (!project) throw new NotFoundException('Project not found');
    try {
      let content: string = '';
      const exporter = new ProjectExporter(project);
      switch (params.format) {
        case ExportFormat.POSTGRESQL:
          content = exporter.toPostgresql();
          break;
        case ExportFormat.MYSQL:
          content = exporter.toMysql();
          break;
        default:
          break;
      }

      return ExportResultDto.from(content, params.format);
    } catch {
      throw new BadRequestException('Failed to export project');
    }
  }
}
