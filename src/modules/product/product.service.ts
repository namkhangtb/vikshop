import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Product, ProductDocument } from './product.schema';
import { Model, Types } from 'mongoose';

import { ApiResponseService, FindManyQueryParam } from '../common';
import { ProductTransformer } from './product.transformer';
import { CreateProductDto, UpdateProductDto } from './types';
import { CounterService } from '../counter/counter.service';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name) private readonly model: Model<ProductDocument>,
    private response: ApiResponseService,
    private counterService: CounterService,
  ) {}

  async findMany(param: FindManyQueryParam) {
    try {
      const filter: any = {};
      const projection: any = {};
      let sort: any = { createdAt: -1 };

      if (param.keyword) {
        filter.$text = { $search: param.keyword };
        projection.score = { $meta: 'textScore' };
        sort = { score: { $meta: 'textScore' }, createdAt: -1 };
      }

      const totalItems = await this.model.countDocuments(filter).exec();
      if (totalItems <= 0) {
        return this.response.base(404, 'ERROR', 'Không có sản phẩm!!!');
      }

      if (param.limit <= 0) {
        return this.response.base(
          400,
          'ERROR',
          'Lỗi: truyền sai dữ liệu limit.',
        );
      }
      if (param.page <= 0) {
        return this.response.base(
          400,
          'ERROR',
          'Lỗi: truyền sai dữ liệu page.',
        );
      }

      const page = Number(param.page) ? Number(param.page) : 1;
      const limit = Number(param.limit) ? Number(param.limit) : 10;
      const skip = (page - 1) * limit;

      const totalPages = Math.ceil(totalItems / limit);
      if (totalPages > 0 && page > totalPages) {
        return this.response.base(
          400,
          'ERROR',
          'Lỗi: số trang (page) vượt quá tổng số trang hiện có.',
        );
      }
      const data = await this.model
        .find(filter, projection)
        .skip(skip)
        .limit(limit)
        .sort(sort)
        .exec();

      const itemCount = data.length;

      return this.response.pagination(
        200,
        'SUCCESS',
        'Lấy dang sách sản phẩm thành công!!!',
        {
          data,
          meta: {
            itemCount,
            totalItems,
            itemsPerPage: limit,
            totalPages,
            currentPage: page,
          },
        },
        ProductTransformer,
      );
    } catch (error) {
      return this.response.base(
        500,
        'ERROR',
        'Lỗi hệ thống: Không thể láy dữ liệu các sản phẩm',
      );
    }
  }

  async findOne(id: string) {
    if (!id || !Types.ObjectId.isValid(id)) {
      return this.response.base(
        400,
        'ERROR',
        'Lỗi: ID sản phẩm không hợp lệ hoặc không được cung cấp',
      );
    }
    const result = await this.model.findById(id).exec();
    if (!result) {
      return this.response.base(
        404,
        'ERROR',
        `Lỗi: Không tìm thấy sản phẩm với id là ${id}`,
      );
    }
    return this.response.item(
      200,
      'SUCCESS',
      'Lấy dữ liệu sản phẩm thành công',
      result,
      ProductTransformer,
    );
  }

  async createOne(createProductDto: CreateProductDto) {
    try {
      let productCode = createProductDto.productCode;
      if (productCode) {
        const existing = await this.model.findOne({ productCode });
        if (existing) {
          return this.response.base(
            400,
            'ERROR',
            `Mã sản phẩm ${productCode} đã tồn tại`,
          );
        }
      } else {
        const nextSeq = await this.counterService.getNextSequence('product');
        productCode = `SP${nextSeq}`;
      }

      const result = await new this.model({
        ...createProductDto,
        productCode,
      }).save();

      return this.response.item(
        201,
        'SUCCESS',
        'Thêm đơn hàng thành công!!!',
        result,
        ProductTransformer,
      );
    } catch (error) {
      return this.response.base(
        500,
        'ERROR',
        error.message || 'Lỗi hệ thống: Không thể tạo sản phẩm',
      );
    }
  }

  async updateOne(id: string, updateProductDto: UpdateProductDto) {
    try {
      if (!id || !Types.ObjectId.isValid(id)) {
        return this.response.base(
          400,
          'ERROR',
          'Lỗi: ID không hợp lệ hoặc không được cung cấp',
        );
      }

      const existingProduct = await this.model.findById(id);
      if (!existingProduct) {
        return this.response.base(
          400,
          'ERROR',
          `Lỗi: Không tìm thấy sản phẩm với id là ${id}`,
        );
      }

      let productCode = updateProductDto.productCode;
      if (productCode && productCode !== existingProduct.productCode) {
        const codeExists = await this.model.findOne({ productCode });
        if (codeExists) {
          return this.response.base(
            400,
            'ERROR',
            `Mã sản phẩm ${productCode} đã tồn tại`,
          );
        }
      } else if (!productCode) {
        const nextSeq = await this.counterService.getNextSequence('product');
        productCode = `SP${nextSeq}`;
      }

      const result = await this.model.findByIdAndUpdate(
        id,
        {
          ...updateProductDto,
          productCode,
        },
        { new: true },
      );

      return this.response.item(
        200,
        'SUCCESS',
        'Sửa đơn hàng thành công!!!',
        result,
        ProductTransformer,
      );
    } catch (error) {
      return this.response.base(
        500,
        'ERROR',
        error.message || 'Lỗi hệ thống: Không thể cập nhật sản phẩm',
      );
    }
  }

  async deleteOne(id: string) {
    try {
      if (!id || !Types.ObjectId.isValid(id)) {
        return this.response.base(
          400,
          'ERROR',
          'Lỗi: ID không hợp lệ hoặc không được cung cấp',
        );
      }
      const deleted = await this.model.findByIdAndDelete(id).exec();
      if (!deleted) {
        return this.response.base(
          404,
          'ERROR',
          `Lỗi: Không tìm thấy sản phẩm với id là ${id}`,
        );
      }
      return this.response.base(
        200,
        'SUCCESS',
        'Xóa dữ liệu sản phẩm thành công',
      );
    } catch (error) {
      return this.response.base(
        500,
        'ERROR',
        'Lỗi hệ thống: Không thể xóa sản phẩm',
      );
    }
  }
}
