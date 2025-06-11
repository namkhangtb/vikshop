import { HydratedDocument, Model } from 'mongoose';
import { ApiResponseService } from './api-response.service';

export class BaseService<T> {
  constructor(
    protected readonly model: Model<HydratedDocument<T>>,
    protected readonly response: ApiResponseService,
  ) {}
}
