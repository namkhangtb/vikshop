import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Order, OrderDocument } from './order.schema';
import { Model } from 'mongoose';
import { CreateOrderDto, UpdateOrderDto } from './types';
import { ProductService } from '../product/product.service';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private readonly model: Model<OrderDocument>,
    private readonly productService: ProductService,
  ) {}

  async findAll(): Promise<Order[]> {
    return await this.model.find().exec();
  }

  async findOne(id: string): Promise<Order> {
    return await this.model.findById(id).exec();
  }

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const totalAmount = await this.calculateTotalAmount(createOrderDto.product);
    return await new this.model({
      ...createOrderDto,
      totalAmount: totalAmount,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).save();
  }

  async update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const totalAmount = await this.calculateTotalAmount(updateOrderDto.product);
    return await this.model
      .findByIdAndUpdate(
        id,
        {
          ...updateOrderDto,
          totalAmount: totalAmount,
          updatedAt: new Date(),
        },
        { new: true },
      )
      .exec();
  }

  async delete(id: string): Promise<Order> {
    return await this.model.findByIdAndDelete(id).exec();
  }

  async calculateTotalAmount(
    products: { productId: string; count: number }[],
  ): Promise<number> {
    let totalAmount: number = 0;

    for (const product of products) {
      const price: number = await this.productService.getPriceByProductId(
        product.productId,
      );
      totalAmount += price * product.count;
    }

    return totalAmount;
  }
}
