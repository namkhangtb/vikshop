import { HydratedDocument, Model } from 'mongoose';
import { ApiResponseService } from './api-response.service';
import { IPaginationOption } from './types';

export class BaseService<T> {
  constructor(
    protected readonly model: Model<HydratedDocument<T>>,
    protected readonly response: ApiResponseService,
  ) {}

  async pagination(query: any, filter: any, options?: IPaginationOption) {
    const page = options?.page && options.page > 0 ? options.page : 1;
    const limit = options?.limit && options.limit > 0 ? options.limit : 10;
    const skip = (page - 1) * limit;

    const data = await query.skip(skip).limit(limit).exec();
    const totalItems = await this.model.countDocuments(filter).exec();

    const itemCount = data.length;
    const totalPages = Math.ceil(totalItems / limit);

    return {
      data,
      meta: {
        itemCount,
        totalItems,
        itemsPerPage: limit,
        totalPages: totalPages,
        currentPage: page,
      },
    };
  }
}
