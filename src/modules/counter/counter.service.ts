import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Counter, CounterDocument } from './counter.schema';
import { Model } from 'mongoose';
import { ApiException } from '@common/exception/types';

@Injectable()
export class CounterService {
  constructor(
    @InjectModel(Counter.name) private model: Model<CounterDocument>,
  ) {}

  async getNextSequence(name: string): Promise<number> {
    const updated = await this.model
      .findOneAndUpdate(
        { name },
        { $inc: { seq: 1 } },
        { new: true, upsert: true },
      )
      .exec();

    if (!updated) {
      throw new ApiException(400, 'Lỗi: Lỗi xảy ra khi gen productCode');
    }

    return updated.seq;
  }
}
