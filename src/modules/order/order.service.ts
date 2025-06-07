import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Order, OrderDocument } from './order.schema';
import { Model } from 'mongoose';
import { CreateOrderDto, FindOrderQueryParam, UpdateOrderDto } from './types';
import { ApiPaginateResponse } from '../common/http/types';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private readonly model: Model<OrderDocument>,
  ) {}

  async findAll(
    param: FindOrderQueryParam,
  ): Promise<ApiPaginateResponse<Order>> {
    let page = Number(param.page) > 0 ? Number(param.page) : 1;
    let limit = Number(param.limit);
    let skip = 0;
    if (limit <= 0) {
      limit = 0;
      page = 1;
    } else {
      limit = limit > 0 ? limit : 10;
      skip = (page - 1) * limit;
    }

    const filter: any = {};
    if (param.name) {
      filter.name = { $regex: param.name, $options: 'i' };
    }
    if (param.phoneNumber) {
      filter.phoneNumber = { $regex: param.phoneNumber, $options: 'i' };
    }
    if (param.email) {
      filter.email = { $regex: param.email, $options: 'i' };
    }

    const data = await this.model
      .find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .exec();
    const totalItems = await this.model.countDocuments(filter).exec();

    const itemCount = data.length;
    const totalPages = Math.ceil(totalItems / limit);

    return {
      data,
      meta: {
        pagination: {
          itemCount,
          totalItems,
          itemsPerPage: limit <= 0 ? totalItems : limit,
          totalPages: limit <= 0 ? 1 : totalPages,
          currentPage: page,
        },
      },
    };
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
