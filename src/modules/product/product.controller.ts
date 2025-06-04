import { Controller, Get, Param } from '@nestjs/common';
import { ProductService } from './product.service';

@Controller('product')
export class ProductController {
  constructor(private readonly service: ProductService) {}

  @Get()
  async index() {
    return await this.service.findAll();
  }

  @Get(':productId')
  async findByProductId(@Param('productId') id: string) {
    return await this.service.getByProductId(id);
  }
}
