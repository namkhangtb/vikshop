import { Expose, Transform, Type } from 'class-transformer';
export class ProductItemTransformer {
  @Expose()
  productId: string;

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
