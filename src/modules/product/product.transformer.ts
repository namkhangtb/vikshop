import { Expose } from 'class-transformer';

export class ProductTransformer {
  @Expose()
  id: string;

  @Expose()
  productCode: string;

  @Expose()
  name: string;

  @Expose()
  retailPrice: number;

  @Expose()
  importPrice: number;

  @Expose()
  wholesalePrice: number;

  @Expose()
  livestreamPrice: number;

  @Expose()
  marketPrice: number;

  @Expose()
  upsalePrice: number;

  @Expose()
  barcode: string;

  @Expose()
  weight: number;

  @Expose()
  shortDescription: string;

  @Expose()
  images: string[];

  @Expose()
  stock: number;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
