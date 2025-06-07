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
import { OrderService } from './order.service';
import { CreateOrderDto, FindOrderQueryParam, UpdateOrderDto } from './types';

@Controller('order')
export class OrderController {
  constructor(private readonly service: OrderService) {}
  @Get()
  async index(@Query() param: FindOrderQueryParam) {
    return await this.service.findAll(param);
  }

  @Get(':id')
  async find(@Param('id') id: string) {
    return await this.service.findOne(id);
  }

  @Post()
  async create(@Body() createOrderDto: CreateOrderDto) {
    return await this.service.create(createOrderDto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    return await this.service.update(id, updateOrderDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.service.delete(id);
  }
}
