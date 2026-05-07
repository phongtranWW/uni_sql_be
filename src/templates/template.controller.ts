import {
  Controller,
  Get,
  Param,
  Query,
  NotFoundException,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { TemplateService } from './template.service';
import { GetManyTemplatesQuery } from './params/get-many-templates.params';

@ApiTags('Templates')
@Controller('templates')
export class TemplateController {
  constructor(private readonly templateService: TemplateService) {}

  @Get()
  @ApiOperation({ summary: 'Get paginated list of templates' })
  async getMany(@Query() query: GetManyTemplatesQuery) {
    return this.templateService.getManyBy(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single template by ID' })
  async getOneById(@Param('id', ParseUUIDPipe) id: string) {
    const template = await this.templateService.getOneById(id);
    if (!template) {
      throw new NotFoundException(`Template with id "${id}" not found`);
    }
    return template;
  }
}
