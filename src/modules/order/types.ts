import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ProductItem {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  count: number;
}

export class UpdateOrderDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  @Matches(/^0\d{9}$/, { message: 'Số điện thoại không hợp lệ (10 số)' })
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email?: string;

  @IsNotEmpty()
  @IsArray()
  @Type(() => ProductItem)
  @ArrayMinSize(1)
  products: ProductItem[];

  @IsOptional()
  @IsNumber({ allowNaN: false }, { message: 'Tổng tiền phải là số' })
  @Min(0)
  @Type(() => Number)
  totalAmount?: number;
}

export class CreateOrderDto extends UpdateOrderDto {}
