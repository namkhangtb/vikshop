import { Injectable } from '@nestjs/common';
import {
  ApiBaseResponse,
  ApiCollectionResponse,
  ApiItemResponse,
  ApiPaginateResponse,
} from './types';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class ApiResponseService {
  base(
    status: number,
    statusText: string,
    message: string,
  ): ApiBaseResponse<null> {
    return { status, statusText, message, data: null };
  }

  item<T>(
    status: number,
    statusText: string,
    message: string,
    data: T,
    transformer,
  ): ApiItemResponse<T> {
    return {
      status,
      statusText,
      message,
      data: plainToInstance(transformer, data, {
        excludeExtraneousValues: true,
      }),
    };
  }

  collection<T>(
    status: number,
    statusText: string,
    message: string,
    data,
    transformer,
  ): ApiCollectionResponse<T> {
    const items = data.map((i) =>
      plainToInstance(transformer, i, {
        excludeExtraneousValues: true,
      }),
    );
    return { status, statusText, message, data: items };
  }

  pagination<T>(
    status,
    statusText,
    message,
    pagination,
    transformer,
  ): ApiPaginateResponse<T> {
    const items = pagination.data.map((item) =>
      plainToInstance(transformer, item, { excludeExtraneousValues: true }),
    );
    return {
      status,
      statusText,
      message,
      data: items,
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
