import { Expose, Transform, Type } from 'class-transformer';
import { ProductTransformer } from '../product/product.transformer';
export class ProductItemTransformer {
  @Expose()
  @Type(() => ProductTransformer)
  productId: ProductTransformer;

  @Expose()
  count: number;
}

export class OrderTransformer {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  phoneNumber: string;

  @Expose()
  email: string;

  @Expose()
  @Type(() => ProductItemTransformer)
  products: ProductItemTransformer[];

  @Expose()
  totalAmount: number;

  @Expose()
  @Transform(({ value }) => value.toISOString())
  createdAt: Date;

  @Expose()
  @Transform(({ value }) => value.toISOString())
  updatedAt: Date;
}
