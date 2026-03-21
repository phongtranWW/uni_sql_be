import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseEnumPipe,
  ParseIntPipe,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { type UserToken } from 'src/auth/strategies/jwt.strategy';
import { UpsertProjectDto } from './dtos/project-upsert.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ProjectDto } from './dtos/project.dto';
import { plainToInstance } from 'class-transformer';
import { ParseObjectIdPipe } from 'src/common/pipes/parse-objectid.pipe';
import { ResponsePagination } from 'src/common/types/response-pagination.type';
import { ProjectSummaryDto } from './dtos/project-summary.dto';
import { ExportFormat } from './params/export-project.params';

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
}
