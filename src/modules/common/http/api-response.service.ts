import { Injectable } from '@nestjs/common';
import {
  ApiCollectionResponse,
  ApiItemResponse,
  ApiPaginateResponse,
  ApiSuccessResponse,
} from './types';

@Injectable()
export class ApiResponseService {
  item<T>(item: T): ApiItemResponse<T> {
    return { data: item };
  }

  collection<T>(collection: T[]): ApiCollectionResponse<T> {
    return { data: collection };
  }

  success(): ApiSuccessResponse {
    return { data: { success: true } };
  }

  pagination<T>(pagination): ApiPaginateResponse<T> {
    return {
      data: pagination.data,
      meta: {
        pagination: {
          itemCount: pagination.meta.itemCount,
          totalItems: pagination.meta.totalItems,
          itemsPerPage: pagination.meta.itemsPerPage,
          currentPage: pagination.meta.currentPage,
          totalPages: pagination.meta.totalPages,
        },
      },
    };
  }
}
