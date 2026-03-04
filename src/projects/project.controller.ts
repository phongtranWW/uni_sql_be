import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { type UserToken } from 'src/auth/strategies/jwt.strategy';
import { UpsertProjectDto } from './dtos/project-upsert.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ProjectDto } from './dtos/project.dto';
import { plainToInstance } from 'class-transformer';
import { ParseObjectIdPipe } from 'src/common/pipes/parse-objectid.pipe';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get(':id')
  async getById(
    @Param('id', ParseObjectIdPipe) id: string,
    @CurrentUser() user: UserToken,
  ) {
    const rawProject = await this.projectService.getById(id, user.id);
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
}
