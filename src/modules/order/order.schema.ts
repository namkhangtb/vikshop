import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ProductItem } from './types';

export type OrderDocument = HydratedDocument<Order>;

@Schema({ timestamps: true })
export class Order {
  @Prop()
  name: string;

  @Prop()
  phoneNumber: string;

  @Prop()
  email: string;

  @Prop({ type: [{ productId: String, count: Number }], required: true })
  products: ProductItem[];

  @Prop()
  totalAmount: number;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

OrderSchema.index({ name: 'text' });
