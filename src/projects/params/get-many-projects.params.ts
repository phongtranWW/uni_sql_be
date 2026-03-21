export interface GetManyProjectsParams {
  search?: string;
  page: number;
  limit: number;
  sortBy: 'name' | 'createdAt' | 'updatedAt';
  sortOrder: 'asc' | 'desc';
}
