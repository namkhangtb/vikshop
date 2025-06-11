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
import { CreateOrderDto, UpdateOrderDto } from './types';
import { FindManyQueryParam } from '../common/http/types';

@Controller('order')
export class OrderController {
  constructor(private readonly service: OrderService) {}
  @Get()
  async findMany(@Query() param: FindManyQueryParam) {
    return await this.service.findMany(param);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.service.findOne(id);
  }

  @Post()
  async createOne(@Body() createOrderDto: CreateOrderDto) {
    return await this.service.createOne(createOrderDto);
  }

  @Put(':id')
  async updateOne(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    return await this.service.updateOne(id, updateOrderDto);
  }

  @Delete(':id')
  async deleteOne(@Param('id') id: string) {
    return await this.service.deleteOne(id);
  }
}
