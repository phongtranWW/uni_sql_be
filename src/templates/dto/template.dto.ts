import { TemplateProjectDto } from './template-project.dto';
import { TemplateAuthorDto } from './template-summary.dto';

export class TemplateDto {
  id: string;
  name: string;
  description: string;
  image: string;
  projectId: string;
  authorId: string;
  author: TemplateAuthorDto;
  project: TemplateProjectDto | null;
  createdAt: Date;
  updatedAt: Date;
}
