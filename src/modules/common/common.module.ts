import { Module } from '@nestjs/common';
import { ApiResponseService } from './http/api-response.service';

@Module({
  imports: [],
  providers: [ApiResponseService],
  exports: [ApiResponseService],
})
export class CommonModule {}
