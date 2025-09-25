import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Order } from '../orders/order.entity';
import { Region } from '../regions/region.entity';

@Injectable()
export class CleanupService {
  private readonly logger = new Logger(CleanupService.name);

  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(Region)
    private readonly regionRepo: Repository<Region>,
  ) {}

  private toNumber(value: unknown): number {
    if (value === null || value === undefined) return 0;
    if (typeof value === 'string') {
      const cleaned = value.replace(/\s+/g, '').replace(/,/g, '.');
      const n = Number(cleaned);
      return Number.isNaN(n) ? 0 : n;
    }
    if (typeof value === 'number') return value;
    try {
      return Number(value as any) || 0;
    } catch {
      return 0;
    }
  }

  /**
   * Region uchun totalBalance larni qayta hisoblash
   */
  private updateRegionTotalBalances(region: Region): void {
    const incomeUzs = this.toNumber(region.balanceIncomeUzs);
    const incomeUsd = this.toNumber(region.balanceIncomeUsd);
    const expenseUzs = this.toNumber(region.balanceExpenseUzs);
    const expenseUsd = this.toNumber(region.balanceExpenseUsd);

    region.totalBalanceUzs = incomeUzs - expenseUzs;
    region.totalBalanceUsd = incomeUsd - expenseUsd;
  }

  /**
   * 30 kundan eski orderlarni o'chirish
   * Har kuni soat 02:00 da ishga tushadi
   */
  @Cron('0 2 * * *') // Har kuni soat 02:00
  async cleanupOldOrders() {
    this.logger.log('🧹 Starting cleanup of orders older than 30 days...');

    try {
      // 30 kun oldingi sana
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      this.logger.log(
        `🗓️ Deleting orders created before: ${thirtyDaysAgo.toISOString()}`,
      );

      // 30 kundan eski orderlarni topish (soft delete qilingan va qilinmaganlarni ham)
      const oldOrders = await this.orderRepo.find({
        where: {
          created_at: LessThan(thirtyDaysAgo),
        },
        relations: ['from_region', 'to_region'],
      });

      if (oldOrders.length === 0) {
        this.logger.log('✅ No old orders found to cleanup');
        return;
      }

      this.logger.log(`📊 Found ${oldOrders.length} orders to cleanup`);

      // Har bir order uchun region balancelarini tuzatish
      const affectedRegions = new Map<string, Region>();

      for (const order of oldOrders) {
        // Agar order soft delete qilinmagan bo'lsa, region balancelarini tuzatish kerak
        if (!order.is_deleted) {
          const { from_region: fromRegion, to_region: toRegion } = order;

          // From region dan expense ni ayirish
          if (fromRegion) {
            if (!affectedRegions.has(fromRegion.id)) {
              affectedRegions.set(fromRegion.id, fromRegion);
            }
            const region = affectedRegions.get(fromRegion.id)!;
            region.balanceExpenseUzs =
              this.toNumber(region.balanceExpenseUzs) -
              this.toNumber(order.expenseUzs);
            region.balanceExpenseUsd =
              this.toNumber(region.balanceExpenseUsd) -
              this.toNumber(order.expenseUsd);
          }

          // To region dan income ni ayirish
          if (toRegion) {
            if (!affectedRegions.has(toRegion.id)) {
              affectedRegions.set(toRegion.id, toRegion);
            }
            const region = affectedRegions.get(toRegion.id)!;
            region.balanceIncomeUzs =
              this.toNumber(region.balanceIncomeUzs) -
              this.toNumber(order.incomeUzs);
            region.balanceIncomeUsd =
              this.toNumber(region.balanceIncomeUsd) -
              this.toNumber(order.incomeUsd);
          }
        }
      }

      // Affected regionlarning totalBalance larini yangilash
      const regionsToUpdate = Array.from(affectedRegions.values());
      for (const region of regionsToUpdate) {
        this.updateRegionTotalBalances(region);
      }

      // Region balancelarini saqlash
      if (regionsToUpdate.length > 0) {
        await this.regionRepo.save(regionsToUpdate);
        this.logger.log(
          `🔄 Updated balances for ${regionsToUpdate.length} regions`,
        );
      }

      // Orderlarni butunlay o'chirish (hard delete)
      const deleteResult = await this.orderRepo.remove(oldOrders);

      this.logger.log(
        `🗑️ Successfully deleted ${deleteResult.length} old orders`,
      );
      this.logger.log('✅ Cleanup completed successfully');
    } catch (error) {
      this.logger.error('❌ Error during cleanup:', error);
    }
  }

  /**
   * Manual cleanup method - testing uchun
   */
  async manualCleanup(
    daysOld: number = 30,
  ): Promise<{ deleted: number; affectedRegions: number }> {
    this.logger.log(
      `🧹 Manual cleanup: deleting orders older than ${daysOld} days`,
    );

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const oldOrders = await this.orderRepo.find({
      where: {
        created_at: LessThan(cutoffDate),
      },
      relations: ['from_region', 'to_region'],
    });

    if (oldOrders.length === 0) {
      return { deleted: 0, affectedRegions: 0 };
    }

    // Region balancelarini tuzatish
    const affectedRegions = new Map<string, Region>();

    for (const order of oldOrders) {
      if (!order.is_deleted) {
        const { from_region: fromRegion, to_region: toRegion } = order;

        if (fromRegion) {
          if (!affectedRegions.has(fromRegion.id)) {
            affectedRegions.set(fromRegion.id, fromRegion);
          }
          const region = affectedRegions.get(fromRegion.id)!;
          region.balanceExpenseUzs =
            this.toNumber(region.balanceExpenseUzs) -
            this.toNumber(order.expenseUzs);
          region.balanceExpenseUsd =
            this.toNumber(region.balanceExpenseUsd) -
            this.toNumber(order.expenseUsd);
        }

        if (toRegion) {
          if (!affectedRegions.has(toRegion.id)) {
            affectedRegions.set(toRegion.id, toRegion);
          }
          const region = affectedRegions.get(toRegion.id)!;
          region.balanceIncomeUzs =
            this.toNumber(region.balanceIncomeUzs) -
            this.toNumber(order.incomeUzs);
          region.balanceIncomeUsd =
            this.toNumber(region.balanceIncomeUsd) -
            this.toNumber(order.incomeUsd);
        }
      }
    }

    // TotalBalance larni yangilash
    const regionsToUpdate = Array.from(affectedRegions.values());
    for (const region of regionsToUpdate) {
      this.updateRegionTotalBalances(region);
    }

    if (regionsToUpdate.length > 0) {
      await this.regionRepo.save(regionsToUpdate);
    }

    // Orderlarni o'chirish
    await this.orderRepo.remove(oldOrders);

    return {
      deleted: oldOrders.length,
      affectedRegions: regionsToUpdate.length,
    };
  }
}
