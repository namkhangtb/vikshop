import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto, UpdateProductDto } from './types';
import { FindManyQueryParam } from '../common/http/types';

@Controller('product')
export class ProductController {
  constructor(private readonly service: ProductService) {}

  @Get()
  async index(@Query() param: FindManyQueryParam) {
    return await this.service.findAll(param);
  }

  @Get(':id')
  async find(@Param('id') id: string) {
    return await this.service.findOne(id);
  }

  @Post()
  async create(@Body() createProductDto: CreateProductDto) {
    return await this.service.create(createProductDto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return await this.service.update(id, updateProductDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.service.delete(id);
  }
}
