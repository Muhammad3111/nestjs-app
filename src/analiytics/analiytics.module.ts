import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../orders/order.entity';
import { AnalyticsService } from './analiytics.service';
import { AnalyticsController } from './analiytics.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Order])],
  providers: [AnalyticsService],
  controllers: [AnalyticsController],
})
export class AnalyticsModule {}
