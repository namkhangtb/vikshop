import {
  ArrayMaxSize,
  IsArray,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

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

  @IsOptional()
  @IsDate()
  createdAt?: Date;

  @IsOptional()
  @IsDate()
  updatedAt?: Date;
}

export class CreateProductDto extends UpdateProductDto {}
