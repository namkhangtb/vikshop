import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ProductDocument = HydratedDocument<Product>;

@Schema()
export class Product {
  @Prop({ unique: true })
  productId: string;

  @Prop()
  name: string;

  @Prop()
  price: number;

  @Prop()
  stock: number;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
