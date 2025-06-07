import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { FindManyQueryParam } from '../common/http/types';

class ProductItem {
  productId: string;
  count: number;
}

export class FindOrderQueryParam extends FindManyQueryParam {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  email?: string;
}

export class UpdateOrderDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsArray()
  @Type(() => ProductItem)
  products?: ProductItem[];

  @IsOptional()
  @IsNumber()
  totalAmount?: number;
}

export class CreateOrderDto extends UpdateOrderDto {}
