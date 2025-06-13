import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseFilters,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto, UpdateProductDto } from './types';
import { FindManyQueryParam } from '@common/http';
import { ApiExceptionFilter } from '@common/exception/api-exception.filter';
@UseFilters(ApiExceptionFilter)
@Controller('product')
export class ProductController {
  constructor(private readonly service: ProductService) {}

  @Get()
  async findMany(@Query() param: FindManyQueryParam) {
    return await this.service.findMany(param);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.service.findOne(id);
  }

  @Post()
  async createOne(@Body() createProductDto: CreateProductDto) {
    return await this.service.createOne(createProductDto);
  }

  @Put(':id')
  async updateOne(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return await this.service.updateOne(id, updateProductDto);
  }

  @Delete(':id')
  async deleteOne(@Param('id') id: string) {
    return await this.service.deleteOne(id);
  }
}
