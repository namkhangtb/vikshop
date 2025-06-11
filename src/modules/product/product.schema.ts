import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ProductDocument = HydratedDocument<Product>;

@Schema({ timestamps: true })
export class Product {
  @Prop({ unique: true })
  productCode: string;

  @Prop()
  name: string;

  @Prop()
  retailPrice: number;

  @Prop()
  importPrice: number;

  @Prop()
  wholesalePrice: number;

  @Prop()
  livestreamPrice: number;

  @Prop()
  marketPrice: number;

  @Prop()
  upsalePrice: number;

  @Prop()
  barcode: string;

  @Prop()
  weight: number;

  @Prop()
  shortDescription: string;

  @Prop({ type: [String] })
  images: string[];

  @Prop()
  stock: number;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

ProductSchema.index({ name: 'text' });
