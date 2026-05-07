export class TemplateAuthorDto {
  name?: string;
  avatar?: string;
}

export class TemplateSummaryDto {
  id: string;
  name: string;
  description: string;
  image: string;
  projectId: string;
  authorId: string;
  author: TemplateAuthorDto;
  createdAt: Date;
  updatedAt: Date;
}
