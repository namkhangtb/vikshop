import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';

export type ApiBaseResponse<T, M = undefined> = {
  status: number;
  statusText: string;
  message: string;
  data: T;
  meta?: M;
};
export type ApiItemResponse<T> = ApiBaseResponse<T>;

export type ApiCollectionResponse<T> = ApiBaseResponse<T[]>;

export type ApiPaginateResponse<T> = ApiBaseResponse<
  T[],
  {
    pagination: IPaginationMeta;
  }
>;

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

export interface IPaginationOption {
  page?: number;
  limit?: number;
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
