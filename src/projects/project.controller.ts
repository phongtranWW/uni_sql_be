import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseEnumPipe,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { type UserToken } from 'src/auth/strategies/jwt.strategy';
import { UpsertProjectDto } from './dtos/project-upsert.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ProjectDto } from './dtos/project.dto';
import { plainToInstance } from 'class-transformer';
import { ParseObjectIdPipe } from 'src/common/pipes/parse-objectid.pipe';
import { ResponsePagination } from 'src/common/types/response-pagination.type';
import { ProjectSummaryDto } from './dtos/project-summary.dto';
import { ExportFormat } from './params/export-project.params';
import { ShareProjectDto } from './dtos/share-project.dto';
import { RevokeShareDto } from './dtos/revoke-share.dto';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get()
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['name', 'createdAt', 'updatedAt'],
  })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @ApiQuery({ name: 'search', required: false, type: String })
  async getManyBy(
    @CurrentUser() user: UserToken,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('sortBy') sortBy: 'name' | 'createdAt' | 'updatedAt',
    @Query('sortOrder') sortOrder: 'asc' | 'desc',
    @Query('search') search?: string,
  ): Promise<ResponsePagination<ProjectSummaryDto>> {
    return await this.projectService.getManyBy(user.id, {
      search,
      page,
      limit,
      sortBy,
      sortOrder,
    });
  }

  @Get('shared-with-me')
  @ApiOperation({
    summary: 'List projects shared with current user',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['name', 'createdAt', 'updatedAt'],
  })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @ApiQuery({ name: 'search', required: false, type: String })
  async getSharedWithMe(
    @CurrentUser() user: UserToken,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('sortBy') sortBy: 'name' | 'createdAt' | 'updatedAt',
    @Query('sortOrder') sortOrder: 'asc' | 'desc',
    @Query('search') search?: string,
  ): Promise<ResponsePagination<ProjectSummaryDto>> {
    return await this.projectService.getSharedWithMe(user.id, {
      search,
      page,
      limit,
      sortBy,
      sortOrder,
    });
  }

  @Get(':id')
  async getOneById(
    @Param('id', ParseObjectIdPipe) id: string,
    @CurrentUser() user: UserToken,
  ) {
    const rawProject = await this.projectService.getOneById(id, user.id);
    return plainToInstance(ProjectDto, rawProject.toObject(), {
      excludeExtraneousValues: true,
    });
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Upsert project',
    description:
      'Updates or creates the project. The request body fully replaces stored `tables`, `refs`, and `indexes`.',
  })
  async upsert(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpsertProjectDto,
    @CurrentUser() user: UserToken,
  ) {
    const rawProject = await this.projectService.upsert(id, dto, user.id);
    return plainToInstance(ProjectDto, rawProject.toObject(), {
      excludeExtraneousValues: true,
    });
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @CurrentUser() user: UserToken) {
    await this.projectService.deleteById(id, user.id);
  }

  @Get(':id/export')
  @ApiQuery({ name: 'format', required: true, enum: ExportFormat })
  async export(
    @Param('id') id: string,
    @CurrentUser() user: UserToken,
    @Query('format', new ParseEnumPipe(ExportFormat))
    format: ExportFormat,
  ) {
    return await this.projectService.export(id, user.id, {
      format,
    });
  }

  @Get(':id/shares')
  @ApiOperation({
    summary: 'List users that the project is shared with (owner only)',
  })
  async getShares(
    @Param('id', ParseObjectIdPipe) id: string,
    @CurrentUser() user: UserToken,
  ) {
    return await this.projectService.getShares(id, user.id);
  }

  @Post(':id/shares')
  @ApiOperation({
    summary: 'Share project with users (owner only)',
    description:
      'Grants the listed users access to the project until `expiresAt`. ' +
      'Re-sharing with an existing user updates the expiration time.',
  })
  async share(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: ShareProjectDto,
    @CurrentUser() user: UserToken,
  ) {
    return await this.projectService.shareWithUsers(id, user.id, dto);
  }

  @Delete(':id/shares')
  @ApiOperation({
    summary: 'Revoke share access for users (owner only)',
  })
  async revokeShares(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: RevokeShareDto,
    @CurrentUser() user: UserToken,
  ) {
    return await this.projectService.revokeShares(id, user.id, dto.userIds);
  }
}
