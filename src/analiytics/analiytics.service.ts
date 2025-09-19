import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../orders/order.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
  ) {}

  async getGlobalStats() {
    const orders = await this.orderRepo.find({
      where: { is_deleted: false },
    });

    let totalIncomeUzs = 0;
    let totalIncomeUsd = 0;
    let totalExpenseUzs = 0;
    let totalExpenseUsd = 0;

    orders.forEach((o) => {
      totalIncomeUzs += Number(o.incomeUzs);
      totalIncomeUsd += Number(o.incomeUsd);
      totalExpenseUzs += Number(o.expenseUzs);
      totalExpenseUsd += Number(o.expenseUsd);
    });

    return {
      totalIncomeUzs,
      totalIncomeUsd,
      totalExpenseUzs,
      totalExpenseUsd,
      totalBalanceUzs: totalIncomeUzs - totalExpenseUzs,
      totalBalanceUsd: totalIncomeUsd - totalExpenseUsd,
    };
  }
}
