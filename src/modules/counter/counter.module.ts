import { Module } from '@nestjs/common';
import { CounterService } from './counter.service';
import { CommonModule } from '../common/common.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Counter, CounterSchema } from './counter.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Counter.name, schema: CounterSchema }]),
    CommonModule,
  ],
  providers: [CounterService],
  exports: [CounterService],
})
export class CounterModule {}
