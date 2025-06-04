import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Order, OrderDocument } from './order.schema';
import { Model } from 'mongoose';
import { CreateOrderDto, UpdateOrderDto } from './types';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private readonly model: Model<OrderDocument>,
  ) {}

  async findAll(): Promise<Order[]> {
    return await this.model.find().exec();
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
