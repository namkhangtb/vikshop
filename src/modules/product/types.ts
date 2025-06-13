import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  productCode?: string;

  @IsString()
  @IsNotEmpty({ message: 'Tên sản phẩm không được để trống' })
  name: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0, { message: 'Giá tiền phải lớn hơn hoặc bằng 0' })
  retailPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0, { message: 'Giá tiền phải lớn hơn hoặc bằng 0' })
  importPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0, { message: 'Giá tiền phải lớn hơn hoặc bằng 0' })
  wholesalePrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0, { message: 'Giá tiền phải lớn hơn hoặc bằng 0' })
  livestreamPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0, { message: 'Giá tiền phải lớn hơn hoặc bằng 0' })
  marketPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0, { message: 'Giá tiền phải lớn hơn hoặc bằng 0' })
  upsalePrice?: number;

  @IsOptional()
  @IsString()
  barcode?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0, { message: 'Khối lượng phải lớn hơn hoặc bằng 0' })
  weight?: number;

  @IsOptional()
  @IsString()
  shortDescription?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(9, { message: 'Số lượng ảnh tối đa không được vượt quá 9' })
  @Type(() => String)
  images?: string[];

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0, { message: 'Tồn kho phải lớn hơn hoặc bằng 0' })
  stock?: number;
}

export class CreateProductDto extends UpdateProductDto {}
