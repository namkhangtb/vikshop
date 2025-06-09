import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Product, ProductDocument } from './product.schema';
import { Model } from 'mongoose';
import { CreateProductDto, UpdateProductDto } from './types';
import { ApiPaginateResponse, FindManyQueryParam } from '../common/http/types';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name) private readonly model: Model<ProductDocument>,
  ) {}

  async findAll(
    param: FindManyQueryParam,
  ): Promise<ApiPaginateResponse<Product>> {
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
    const projection: any = {};
    let sort: any = { createdAt: -1 };

    if (param.keyword) {
      filter.$text = { $search: param.keyword };
      projection.score = { $meta: 'textScore' };
      sort = { score: { $meta: 'textScore' }, createAt: -1 };
    }

    const data = await this.model
      .find(filter)
      .skip(skip)
      .limit(limit)
      .sort(sort)
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
