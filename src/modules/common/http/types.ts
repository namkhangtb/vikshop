import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';

export type ApiPaginateResponse<T> = {
  data: T[];
  meta: {
    pagination: IPaginationMeta;
  };
};

export interface IPaginationMeta {
  /**
   * the amount of items on this specific page
   */
  itemCount: number;
  /**
   * the total amount of items
   */
  totalItems: number;
  /**
   * the amount of items that were requested per page
   */
  itemsPerPage: number;
  /**
   * the total amount of pages in this paginator
   */
  totalPages: number;
  /**
   * the current page this paginator "points" to
   */
  currentPage: number;
}

export class FindManyQueryParam {
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  page?: number;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  limit?: number;

  @IsOptional()
  @IsString()
  keyword?: string;
}
