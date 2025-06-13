import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Product, ProductDocument } from './product.schema';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument } from '../order/order.schema';
import { ApiResponseService, FindManyQueryParam } from '@common/http';
import { ProductTransformer } from './product.transformer';
import { CreateProductDto, UpdateProductDto } from './types';
import { CounterService } from '../counter/counter.service';
import { ApiException } from '@common/exception/types';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name) private readonly model: Model<ProductDocument>,
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
    private response: ApiResponseService,
    private counterService: CounterService,
  ) {}

  async findMany(param: FindManyQueryParam) {
    const filter: any = {};
    const projection: any = {};
    let sort: any = { createdAt: -1 };

    if (param.keyword) {
      filter.$text = { $search: param.keyword };
      projection.score = { $meta: 'textScore' };
      sort = { score: { $meta: 'textScore' }, createdAt: -1 };
    }

    if (param.limit <= 0) {
      throw new ApiException(400, 'Lỗi: truyền sai dữ liệu limit.');
    }
    if (param.page <= 0) {
      throw new ApiException(400, 'Lỗi: truyền sai dữ liệu page.');
    }

    const page = Number(param.page) ? Number(param.page) : 1;
    const limit = Number(param.limit) ? Number(param.limit) : 10;
    const skip = (page - 1) * limit;

    const totalItems = await this.model.countDocuments(filter).exec();
    if (totalItems <= 0) {
      throw new ApiException(404, 'Không có sản phẩm!!!');
    }

    const totalPages = Math.ceil(totalItems / limit);
    if (totalPages > 0 && page > totalPages) {
      throw new ApiException(
        400,
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
  }

  async findOne(id: string) {
    if (!id || !Types.ObjectId.isValid(id)) {
      throw new ApiException(
        400,
        'Lỗi: ID sản phẩm không hợp lệ hoặc không được cung cấp',
      );
    }
    const result = await this.model.findById(id).exec();
    if (!result) {
      throw new ApiException(
        404,
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
    let productCode = createProductDto.productCode;
    if (productCode) {
      const existing = await this.model.findOne({ productCode });
      if (existing) {
        throw new ApiException(400, `Mã sản phẩm ${productCode} đã tồn tại`);
      }
    } else {
      let nextSeq = await this.counterService.getNextSequence('product');
      productCode = `SP${nextSeq}`;
      while (await this.model.findOne({ productCode })) {
        nextSeq = await this.counterService.getNextSequence('product');
        productCode = `SP${nextSeq}`;
      }
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
  }

  async updateOne(id: string, updateProductDto: UpdateProductDto) {
    if (!id || !Types.ObjectId.isValid(id)) {
      throw new ApiException(
        400,
        'Lỗi: ID không hợp lệ hoặc không được cung cấp',
      );
    }

    const existingProduct = await this.model.findById(id);
    if (!existingProduct) {
      throw new ApiException(
        400,
        `Lỗi: Không tìm thấy sản phẩm với id là ${id}`,
      );
    }

    let productCode = updateProductDto.productCode;
    if (productCode && productCode !== existingProduct.productCode) {
      const codeExists = await this.model.findOne({ productCode });
      if (codeExists) {
        throw new ApiException(400, `Mã sản phẩm ${productCode} đã tồn tại`);
      }
    } else if (!productCode) {
      let nextSeq = await this.counterService.getNextSequence('product');
      productCode = `SP${nextSeq}`;
      while (await this.model.findOne({ productCode })) {
        nextSeq = await this.counterService.getNextSequence('product');
        productCode = `SP${nextSeq}`;
      }
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
  }

  async deleteOne(id: string) {
    if (!id || !Types.ObjectId.isValid(id)) {
      throw new ApiException(
        400,
        'Lỗi: ID không hợp lệ hoặc không được cung cấp',
      );
    }

    const product = await this.model.findById(id).exec();
    if (!product) {
      throw new ApiException(
        404,
        `Lỗi: Không tìm thấy sản phẩm với id là ${id}`,
      );
    }

    const orderUsingProduct = await this.orderModel
      .findOne({
        'products.productId': id,
      })
      .exec();

    if (orderUsingProduct) {
      throw new ApiException(
        400,
        'Không thể xóa sản phẩm này vì đang được sử dụng trong đơn hàng',
      );
    }

    await this.model.findByIdAndDelete(id).exec();
    return this.response.base(
      200,
      'SUCCESS',
      'Xóa dữ liệu sản phẩm thành công',
    );
  }
}
