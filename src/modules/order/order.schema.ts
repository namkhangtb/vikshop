import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';

export type OrderDocument = HydratedDocument<Order>;

@Schema({ timestamps: true })
export class Order {
  @Prop()
  name: string;

  @Prop()
  phoneNumber: string;

  @Prop()
  email: string;

  @Prop([
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      count: { type: Number },
    },
  ])
  products: {
    productId: Types.ObjectId;
    count: number;
  }[];

  @Prop()
  totalAmount: number;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

OrderSchema.index({ name: 'text' });
