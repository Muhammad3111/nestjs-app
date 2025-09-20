import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../orders/order.entity';
import { Region } from '../regions/region.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(Region)
    private readonly regionRepo: Repository<Region>,
  ) {}

  async getGlobalStats() {
    const [orders, regions] = await Promise.all([
      this.orderRepo.find({
        where: { is_deleted: false },
      }),
      this.regionRepo.find(),
    ]);

    let totalIncomeUzs = 0;
    let totalIncomeUsd = 0;
    let totalExpenseUzs = 0;
    let totalExpenseUsd = 0;
    let totalBalanceUzs = 0;
    let totalBalanceUsd = 0;
    let totalFlowBalanceUzs = 0;
    let totalFlowBalanceUsd = 0;

    regions.forEach((region) => {
      const balanceIncomeUzs = Number(region.balanceIncomeUzs ?? 0);
      const balanceIncomeUsd = Number(region.balanceIncomeUsd ?? 0);
      const balanceExpenseUzs = Number(region.balanceExpenseUzs ?? 0);
      const balanceExpenseUsd = Number(region.balanceExpenseUsd ?? 0);
      const balanceUzs = Number(region.balanceUzs ?? 0);
      const balanceUsd = Number(region.balanceUsd ?? 0);

      totalIncomeUzs += balanceIncomeUzs;
      totalIncomeUsd += balanceIncomeUsd;
      totalExpenseUzs += balanceExpenseUzs;
      totalExpenseUsd += balanceExpenseUsd;
      totalBalanceUzs += balanceUzs;
      totalBalanceUsd += balanceUsd;
    });

    orders.forEach((order) => {
      const incomeUzs = Number(order.incomeUzs ?? 0);
      const incomeUsd = Number(order.incomeUsd ?? 0);
      const expenseUzs = Number(order.expenseUzs ?? 0);
      const expenseUsd = Number(order.expenseUsd ?? 0);

      totalFlowBalanceUzs += incomeUzs - expenseUzs;
      totalFlowBalanceUsd += incomeUsd - expenseUsd;
    });

    return {
      totalIncomeUzs,
      totalIncomeUsd,
      totalExpenseUzs,
      totalExpenseUsd,
      totalBalanceUzs,
      totalBalanceUsd,
      totalFlowBalanceUzs,
      totalFlowBalanceUsd,
    };
  }
}
