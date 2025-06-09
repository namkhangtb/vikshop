import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Order, OrderDocument } from './order.schema';
import { Model } from 'mongoose';
import { CreateOrderDto, UpdateOrderDto } from './types';
import {
  ApiCollectionResponse,
  ApiItemResponse,
  ApiPaginateResponse,
  FindManyQueryParam,
} from '../common/http/types';
import { ApiResponseService, BaseService } from '../common';

@Injectable()
export class OrderService extends BaseService<Order> {
  constructor(
    @InjectModel(Order.name) model: Model<OrderDocument>,
    response: ApiResponseService,
  ) {
    super(model, response);
  }

  async findAll(
    param: FindManyQueryParam,
  ): Promise<
    | ApiCollectionResponse<Order>
    | ApiItemResponse<Order>
    | ApiPaginateResponse<Order>
  > {
    const page = Number(param.page) ?? 1;
    const limit = Number(param.limit) ?? 10;

    const filter: any = {};
    const projection: any = {};
    let sort: any = { createdAt: -1 };
    if (param.keyword) {
      filter.$text = { $search: param.keyword };
      projection.score = { $meta: 'textScore' };
      sort = { score: { $meta: 'textScore' }, createAt: -1 };
    }
    const query = this.model.find(filter, projection).sort(sort);
    if (limit < 0) {
      const result = await query.exec();
      return this.response.collection(result);
    } else if (limit === 1) {
      const result = await query.limit(1).exec();
      return this.response.item(result);
    } else {
      const result = await this.pagination(query, filter, { page, limit });
      return this.response.pagination(result);
    }
  }

  async findOne(id: string): Promise<Order> {
    return await this.model.findById(id).exec();
  }

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    return await new this.model({
      ...createOrderDto,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).save();
  }

  async update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
    return await this.model
      .findByIdAndUpdate(
        id,
        {
          ...updateOrderDto,
          updatedAt: new Date(),
        },
        { new: true },
      )
      .exec();
  }

  async delete(id: string): Promise<Order> {
    return await this.model.findByIdAndDelete(id).exec();
  }
}
