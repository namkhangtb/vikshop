class ProductItem {
  productId: string;
  count: number;
}
export class UpdateOrderDto {
  name?: string;
  phoneNumber?: string;
  email?: string;
  products?: ProductItem[];
  totalAmount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class CreateOrderDto extends UpdateOrderDto {}
