import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Product, ProductDocument } from './product.schema';
import { Model } from 'mongoose';
import { CreateProductDto, UpdateProductDto } from './types';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name) private readonly model: Model<ProductDocument>,
  ) {}

  async findAll(): Promise<Product[]> {
    return await this.model.find().exec();
  }

  async findOne(id: string): Promise<Product> {
    return await this.model.findById(id).exec();
  }

  async create(createProductDto: CreateProductDto): Promise<Product> {
    if (createProductDto.productId) {
      const existing = await this.model.findOne({
        productId: createProductDto.productId,
      });
      if (existing) {
        throw new BadRequestException(
          `Mã sản phẩm "${createProductDto.productId}" đã tồn tại.`,
        );
      }
    } else {
      createProductDto.productId = await this.generateNextCode();
    }

    return await new this.model({
      ...createProductDto,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).save();
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    return await this.model
      .findByIdAndUpdate(
        id,
        {
          ...updateProductDto,
          updatedAt: new Date(),
        },
        { new: true },
      )
      .exec();
  }

  async delete(id: string): Promise<Product> {
    return await this.model.findByIdAndDelete(id).exec();
  }

  private async generateNextCode(): Promise<string> {
    const products = await this.model.find({ productId: /^SP\d+$/ }).exec();

    let maxNumber = 0;
    for (const product of products) {
      const match = product.productId.match(/^SP(\d+)$/);

      if (match) {
        const number = parseInt(match[1], 10);
        if (number > maxNumber) {
          maxNumber = number;
        }
      }
    }
    const nextNumber = maxNumber + 1;
    const nextProductId = 'SP' + nextNumber;
    return nextProductId;
  }
}
