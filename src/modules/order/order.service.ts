import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Order, OrderDocument } from './order.schema';
import { Model, Types } from 'mongoose';
import { CreateOrderDto, ProductItem, UpdateOrderDto } from './types';
import { FindManyQueryParam } from '../common/http/types';
import { ApiResponseService } from '../common';
import { ProductService } from '../product/product.service';
import { OrderTransformer } from './order.transformer';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private readonly model: Model<OrderDocument>,
    private response: ApiResponseService,
    private productService: ProductService,
  ) {}

  async findMany(param: FindManyQueryParam) {
    try {
      const filter: any = {};
      const projection: any = {};
      let sort: any = { createdAt: -1 };

      if (param.keyword) {
        filter.$text = { $search: param.keyword };
        projection.score = { $meta: 'textScore' };
        sort = { score: { $meta: 'textScore' }, createAt: -1 };
      }

      const totalItems = await this.model.countDocuments(filter).exec();
      if (totalItems <= 0) {
        return this.response.base(404, 'ERROR', 'Không có đơn hàng!!!');
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
        .populate('products.productId')
        .skip(skip)
        .limit(limit)
        .sort(sort)
        .exec();

      const itemCount = data.length;

      return this.response.pagination(
        200,
        'SUCCESS',
        'Lấy dang sách đơn hàng thành công!!!',
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
        OrderTransformer,
      );
    } catch (error) {
      return this.response.base(
        500,
        'ERROR',
        'Lỗi hệ thống: Không thể láy dữ liệu các đơn hàng',
      );
    }
  }

  async findOne(id: string) {
    try {
      if (!id || !Types.ObjectId.isValid(id)) {
        return this.response.base(
          400,
          'ERROR',
          'Lỗi: ID không hợp lệ hoặc không được cung cấp',
        );
      }
      const result = await this.model
        .findById(id)
        .populate('products.productId')
        .exec();
      if (!result) {
        return this.response.base(
          404,
          'ERROR',
          `Lỗi: Không tìm thấy đơn hàng với id là ${id}`,
        );
      }
      return this.response.item(
        200,
        'SUCCESS',
        'Lấy dữ liệu đơn hàng thành công',
        result,
        OrderTransformer,
      );
    } catch (error) {
      return this.response.base(
        500,
        'ERROR',
        'Lỗi hệ thống: Không thể láy dữ liệu đơn hàng',
      );
    }
  }

  async createOne(createOrderDto: CreateOrderDto) {
    try {
      if (!createOrderDto.products || createOrderDto.products.length < 1) {
        return this.response.base(
          400,
          'ERROR',
          'Lỗi: Đơn hàng phải có ít nhất 1 sản phẩm',
        );
      }

      const totalAmount = await this.calculateTotalAmount(
        createOrderDto.products,
      );
      if (totalAmount !== createOrderDto.totalAmount) {
        return this.response.base(
          400,
          'ERROR',
          'Lỗi: Dữ liệu totalAmout truyền vào không trùng khớp với giá trị tính toán được',
        );
      }

      const result = await new this.model({
        ...createOrderDto,
        totalAmount,
      }).save();

      const populatedResult = await result.populate('products.productId');
      const plainResult = {
        ...populatedResult.toObject(),
        products: populatedResult.products.map((item) => ({
          productId:
            item.productId?._id?.toString() || item.productId?.toString(),
          count: item.count,
        })),
      };
      return this.response.item(
        201,
        'SUCCESS',
        'Thêm đơn hàng thành công!!!',
        plainResult,
        OrderTransformer,
      );
    } catch (error) {
      return this.response.base(
        500,
        'ERROR',
        error.message || 'Lỗi hệ thống: Không thể tạo đơn hàng',
      );
    }
  }

  private async calculateTotalAmount(products: ProductItem[]): Promise<number> {
    try {
      for (const item of products) {
        const { productId, count } = item;
        if (!productId || !Types.ObjectId.isValid(productId)) {
          throw new Error(
            `Lỗi: ID sản phẩm không hợp lệ hoặc không được cung cấp ${productId}`,
          );
        }
        if (!count || count <= 0) {
          throw new Error('Lỗi: Số lượng sản phẩm tối thiểu phải là 1');
        }
      }
      const productResults = await Promise.all(
        products.map((item) => this.productService.findOne(item.productId)),
      );
      let total = 0;
      for (let i = 0; i < productResults.length; i++) {
        const { data } = productResults[i];
        if (!data?.retailPrice) {
          throw new Error(
            `Lỗi: Không tìm thấy thông tin giá bán sản phẩm với ID: ${products[i].productId}`,
          );
        }
        total += data.retailPrice * products[i].count;
      }
      return total;
    } catch (error) {
      throw new Error(
        error.message || 'Lỗi hệ thống khi tính tổng giá trị đơn hàng',
      );
    }
  }

  async updateOne(id: string, updateOrderDto: UpdateOrderDto) {
    try {
      if (!id || !Types.ObjectId.isValid(id)) {
        return this.response.base(
          400,
          'ERROR',
          'Lỗi: ID không hợp lệ hoặc không được cung cấp',
        );
      }

      const existingOrder = await this.model.findById(id);
      if (!existingOrder) {
        return this.response.base(
          400,
          'ERROR',
          `Lỗi: Không tìm thấy đơn hàng với id là ${id}`,
        );
      }

      if (!updateOrderDto.products || updateOrderDto.products.length < 1) {
        return this.response.base(
          400,
          'ERROR',
          'Lỗi: Đơn hàng phải có ít nhất 1 sản phẩm',
        );
      }

      const totalAmount = await this.calculateTotalAmount(
        updateOrderDto.products,
      );
      if (totalAmount !== updateOrderDto.totalAmount) {
        return this.response.base(
          400,
          'ERROR',
          'Lỗi: Dữ liệu totalAmout truyền vào không trùng khớp với giá trị tính toán được',
        );
      }

      const result = await this.model.findByIdAndUpdate(
        id,
        { ...updateOrderDto, totalAmount },
        { new: true },
      );

      const populatedResult = await result.populate('products.productId');
      const plainResult = {
        ...populatedResult.toObject(),
        products: populatedResult.products.map((item) => ({
          productId:
            item.productId?._id?.toString() || item.productId?.toString(),
          count: item.count,
        })),
      };

      return this.response.item(
        200,
        'SUCCESS',
        'Cập nhật đơn hàng thành công',
        plainResult,
        OrderTransformer,
      );
    } catch (error) {
      return this.response.base(
        500,
        'ERROR',
        error.message || 'Lỗi hệ thống: Không thể cập nhật đơn hàng',
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
          `Lỗi: Không tìm thấy đơn hàng với id là ${id}`,
        );
      }
      return this.response.base(
        200,
        'SUCCESS',
        'Xóa dữ liệu đơn hàng thành công',
      );
    } catch (error) {
      return this.response.base(
        500,
        'ERROR',
        'Lỗi hệ thống: Không thể xóa đơn hàng',
      );
    }
  }
}
