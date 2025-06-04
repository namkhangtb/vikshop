import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Product, ProductDocument } from './product.schema';
import { Model } from 'mongoose';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name) private readonly model: Model<ProductDocument>,
  ) {}

  async findAll(): Promise<Product[]> {
    return await this.model.find().exec();
  }

  async getPriceByProductId(productId: string): Promise<number> {
    const product = await this.model
      .findOne({ productId }, { price: 1, _id: 0 })
      .exec();
    return product.price;
  }
  async getByProductId(productId: string): Promise<Product> {
    const product = await this.model.findOne({ productId }).exec();
    return product;
  }
}
