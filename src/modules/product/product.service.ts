import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Product, ProductDocument } from './product.schema';
import { Model } from 'mongoose';
import { CreateProductDto, UpdateProductDto } from './types';
import {
  ApiCollectionResponse,
  ApiItemResponse,
  ApiPaginateResponse,
  FindManyQueryParam,
} from '../common/http/types';
import { ApiResponseService, BaseService } from '../common';

@Injectable()
export class ProductService extends BaseService<Product> {
  constructor(
    @InjectModel(Product.name) model: Model<ProductDocument>,
    response: ApiResponseService,
  ) {
    super(model, response);
  }

  async findAll(
    param: FindManyQueryParam,
  ): Promise<
    | ApiCollectionResponse<Product>
    | ApiItemResponse<Product>
    | ApiPaginateResponse<Product>
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
