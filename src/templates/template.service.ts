import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectModel } from '@nestjs/mongoose';
import { Repository, ILike } from 'typeorm';
import { Model } from 'mongoose';
import { Template } from './entities/template.entity';
import { Project, ProjectDocument } from '../projects/schemas/project.schema';
import { GetManyTemplatesQuery } from './params/get-many-templates.params';
import { TemplateDto } from './dto/template.dto';
import { TemplateSummaryDto } from './dto/template-summary.dto';
import { TemplateProjectDto } from './dto/template-project.dto';
import { ResponsePagination } from '../common/types/response-pagination.type';

@Injectable()
export class TemplateService {
  constructor(
    @InjectRepository(Template)
    private readonly templateRepository: Repository<Template>,
    @InjectModel(Project.name)
    private readonly projectModel: Model<ProjectDocument>,
  ) {}

  async getOneById(id: string): Promise<TemplateDto | null> {
    const template = await this.templateRepository.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!template) return null;

    const projectDoc = await this.projectModel
      .findById(template.projectId)
      .lean()
      .exec();

    const project: TemplateProjectDto | null = projectDoc
      ? this.toProjectDto(projectDoc)
      : null;

    return {
      id: template.id,
      name: template.name,
      description: template.description,
      image: template.image,
      projectId: template.projectId,
      authorId: template.authorId,
      author: {
        name: template.author?.name,
        avatar: template.author?.avatar,
      },
      project,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
    };
  }

  async getManyBy(
    params: GetManyTemplatesQuery,
  ): Promise<ResponsePagination<TemplateSummaryDto>> {
    const { search, page, limit, sortBy, sortOrder } = params;

    const skip = (page - 1) * limit;

    const where = search ? { name: ILike(`%${search}%`) } : {};

    const [templates, total] = await this.templateRepository.findAndCount({
      where,
      relations: ['author'],
      skip,
      take: limit,
      order: {
        [sortBy]: sortOrder.toUpperCase(),
      },
    });

    const data: TemplateSummaryDto[] = templates.map((template) => ({
      id: template.id,
      name: template.name,
      description: template.description,
      image: template.image,
      projectId: template.projectId,
      authorId: template.authorId,
      author: {
        name: template.author?.name,
        avatar: template.author?.avatar,
      },
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
    }));

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ── Private helpers ──────────────────────────────────

  private toProjectDto(doc: Record<string, any>): TemplateProjectDto {
    return {
      id: doc._id.toString(),
      name: doc.name,
      tables: (doc.tables ?? []).map((t: Record<string, any>) => ({
        name: t.name,
        fields: (t.fields ?? []).map((f: Record<string, any>) => ({
          name: f.name,
          type: f.type,
          unique: f.unique ?? false,
          pk: f.pk ?? false,
          not_null: f.not_null ?? false,
          increment: f.increment ?? false,
          default: f.default ?? null,
        })),
        headerColor: t.headerColor,
        isSelected: t.isSelected ?? false,
        alias: t.alias ?? null,
        position: { x: t.position?.x ?? 0, y: t.position?.y ?? 0 },
      })),
      refs: (doc.refs ?? []).map((r: Record<string, any>) => ({
        name: r.name,
        isSelected: r.isSelected ?? false,
        endpoints: [
          {
            tableName: r.endpoints?.[0]?.tableName,
            fieldName: r.endpoints?.[0]?.fieldName,
          },
          {
            tableName: r.endpoints?.[1]?.tableName,
            fieldName: r.endpoints?.[1]?.fieldName,
          },
        ] as [
          { tableName: string; fieldName: string },
          { tableName: string; fieldName: string },
        ],
        operator: r.operator,
      })),
      indexes: (doc.indexes ?? []).map((i: Record<string, any>) => ({
        name: i.name,
        tableName: i.tableName,
        fields: i.fields ?? [],
        unique: i.unique ?? false,
      })),
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}
