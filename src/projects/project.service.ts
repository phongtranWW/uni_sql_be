import {
  BadRequestException,
  ForbiddenException,
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
import { ShareProjectDto } from './dtos/share-project.dto';
import { ProjectShareDto, SharedUserDto } from './dtos/project-share.dto';
import { UserService } from 'src/users/user.service';

@Injectable()
export class ProjectService {
  constructor(
    @InjectModel(Project.name)
    private readonly projectModel: Model<ProjectDocument>,
    private readonly userService: UserService,
  ) {}

  async getOneById(id: string, userId: string): Promise<ProjectDocument> {
    const now = new Date();
    const project = await this.projectModel
      .findOne({
        _id: id,
        $or: [
          { userId },
          {
            shares: {
              $elemMatch: {
                userId,
                $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }],
              },
            },
          },
        ],
      })
      .exec();

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

    const data = await this.buildProjectSummaries(docs);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getSharedWithMe(
    userId: string,
    params: GetManyProjectsParams,
  ): Promise<ResponsePagination<ProjectSummaryDto>> {
    const { search, page, limit, sortBy, sortOrder } = params;
    const now = new Date();

    const filter: Record<string, unknown> = {
      shares: {
        $elemMatch: {
          userId,
          $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }],
        },
      },
    };

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

    const data = await this.buildProjectSummaries(docs);

    return {
      data,
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
    const result = await this.projectModel
      .findOneAndUpdate(
        { _id: id, userId },
        { $set: { ...dto, userId } },
        { upsert: true, returnDocument: 'after', runValidators: true },
      )
      .exec();

    return result;
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
    const project = await this.getOneById(id, userId);
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
        case ExportFormat.JSON:
          content = exporter.toJson();
          break;
        default:
          break;
      }

      return ExportResultDto.from(content, params.format);
    } catch {
      throw new BadRequestException('Failed to export project');
    }
  }

  async shareWithUsers(
    projectId: string,
    ownerId: string,
    dto: ShareProjectDto,
  ): Promise<ProjectShareDto[]> {
    const project = await this.findOwnedProjectOrFail(projectId, ownerId);

    if (dto.userIds.includes(ownerId)) {
      throw new BadRequestException('Cannot share project with yourself');
    }

    const users = await this.userService.findByIds(dto.userIds);
    if (users.length !== dto.userIds.length) {
      const foundIds = new Set(users.map((u) => u.id));
      const missing = dto.userIds.filter((id) => !foundIds.has(id));
      throw new BadRequestException(`Users not found: ${missing.join(', ')}`);
    }

    const expiresAt = dto.expiresAt ?? null;
    const now = new Date();
    const existing = new Map(
      project.shares.map((share) => [share.userId, share]),
    );

    for (const targetId of dto.userIds) {
      const current = existing.get(targetId);
      if (current) {
        current.expiresAt = expiresAt;
      } else {
        project.shares.push({
          userId: targetId,
          expiresAt,
          createdAt: now,
        });
      }
    }

    await project.save();

    return this.buildShareDtos(project.shares);
  }

  async revokeShares(
    projectId: string,
    ownerId: string,
    userIds: string[],
  ): Promise<ProjectShareDto[]> {
    const project = await this.findOwnedProjectOrFail(projectId, ownerId);

    const targetIds = new Set(userIds);
    const before = project.shares.length;
    project.shares = project.shares.filter(
      (share) => !targetIds.has(share.userId),
    );

    if (project.shares.length === before) {
      throw new NotFoundException('No matching shares to revoke');
    }

    await project.save();

    return this.buildShareDtos(project.shares);
  }

  async getShares(
    projectId: string,
    ownerId: string,
  ): Promise<ProjectShareDto[]> {
    const project = await this.findOwnedProjectOrFail(projectId, ownerId);
    return this.buildShareDtos(project.shares);
  }

  private async buildProjectSummaries(
    docs: ProjectDocument[],
  ): Promise<ProjectSummaryDto[]> {
    if (docs.length === 0) return [];

    const userIds = new Set<string>();
    const now = new Date();

    docs.forEach((doc) => {
      doc.shares?.forEach((share) => {
        if (!share.expiresAt || share.expiresAt > now) {
          userIds.add(share.userId);
        }
      });
    });

    const users = await this.userService.findByIds(Array.from(userIds));
    const userMap = new Map(
      users.map((u) => [u.id, { id: u.id, name: u.name, avatar: u.avatar }]),
    );

    const data = docs.map((doc) => {
      const plainDoc = doc.toObject() as any;
      plainDoc.sharedUsers = doc.shares
        ?.filter((share) => !share.expiresAt || share.expiresAt > now)
        .map((share) => userMap.get(share.userId))
        .filter(Boolean);
      return plainDoc;
    });

    return plainToInstance(ProjectSummaryDto, data, {
      excludeExtraneousValues: true,
    });
  }

  private async findOwnedProjectOrFail(
    projectId: string,
    ownerId: string,
  ): Promise<ProjectDocument> {
    const project = await this.projectModel.findById(projectId).exec();
    if (!project) throw new NotFoundException('Project not found');
    if (project.userId !== ownerId) {
      throw new ForbiddenException(
        'Only the project owner can perform this action',
      );
    }
    return project;
  }

  private async buildShareDtos(
    shares: ProjectDocument['shares'],
  ): Promise<ProjectShareDto[]> {
    if (shares.length === 0) return [];

    const users = await this.userService.findByIds(
      shares.map((share) => share.userId),
    );
    const userMap = new Map(
      users.map((user) => [
        user.id,
        plainToInstance(SharedUserDto, user, {
          excludeExtraneousValues: true,
        }),
      ]),
    );

    return shares.map((share) => ({
      userId: share.userId,
      expiresAt: share.expiresAt ?? null,
      createdAt: share.createdAt,
      user: userMap.get(share.userId),
    }));
  }
}
