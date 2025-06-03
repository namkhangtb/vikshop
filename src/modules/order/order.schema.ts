import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type OrderDocument = HydratedDocument<Order>;

@Schema()
export class Order {
  @Prop()
  name: string;

  @Prop()
  phoneNumber: string;

  @Prop()
  email: string;

  @Prop({
    type: [
      {
        productId: { type: String, required: true },
        count: { type: Number, required: true },
      },
    ],
    required: true,
  })
  product: {
    productId: string;
    count: number;
  }[];

  @Prop()
  totalAmount: number;

  @Prop({ required: true })
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
