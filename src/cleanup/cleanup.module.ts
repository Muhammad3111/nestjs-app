import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CleanupService } from './cleanup.service';
import { CleanupController } from './cleanup.controller';
import { Order } from '../orders/order.entity';
import { Region } from '../regions/region.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, Region])],
  controllers: [CleanupController],
  providers: [CleanupService],
  exports: [CleanupService],
})
export class CleanupModule {}
