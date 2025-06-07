import {
  ArrayMaxSize,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { FindManyQueryParam } from '../common/http/types';

export class FindProductQueryParam extends FindManyQueryParam {
  @IsOptional()
  @IsString()
  productId?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  retailPrice?: number;

  @IsOptional()
  @IsNumber()
  importPrice?: number;

  @IsOptional()
  @IsNumber()
  wholesalePrice?: number;

  @IsOptional()
  @IsNumber()
  livestreamPrice?: number;

  @IsOptional()
  @IsNumber()
  marketPrice?: number;

  @IsOptional()
  @IsNumber()
  upsalePrice?: number;

  @IsOptional()
  @IsString()
  barcode?: string;

  @IsOptional()
  @IsNumber()
  weight?: number;

  @IsOptional()
  @IsNumber()
  stock?: number;
}

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  productId?: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsNumber()
  retailPrice?: number;

  @IsOptional()
  @IsNumber()
  importPrice?: number;

  @IsOptional()
  @IsNumber()
  wholesalePrice?: number;

  @IsOptional()
  @IsNumber()
  livestreamPrice?: number;

  @IsOptional()
  @IsNumber()
  marketPrice?: number;

  @IsOptional()
  @IsNumber()
  upsalePrice?: number;

  @IsOptional()
  @IsString()
  barcode?: string;

  @IsOptional()
  @IsNumber()
  weight?: number;

  @IsOptional()
  @IsString()
  shortDescription?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(9)
  images?: string[];

  @IsOptional()
  @IsNumber()
  stock?: number;
}

export class CreateProductDto extends UpdateProductDto {}
