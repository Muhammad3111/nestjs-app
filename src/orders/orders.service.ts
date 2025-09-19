import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './order.entity';
import { Region } from '../regions/region.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PaginationQueryDto } from 'src/orders/dto/pagination-query.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(Region)
    private readonly regionRepo: Repository<Region>,
  ) {}

  async create(dto: CreateOrderDto): Promise<Order> {
    const {
      fromRegionId,
      toRegionId,
      phone,
      incomeUzs,
      expenseUzs,
      incomeUsd,
      expenseUsd,
    } = dto;

    const fromRegion = await this.regionRepo.findOne({
      where: { id: fromRegionId },
    });
    if (!fromRegion)
      throw new NotFoundException(
        `From region with id ${fromRegionId} not found`,
      );

    const toRegion = await this.regionRepo.findOne({
      where: { id: toRegionId },
    });
    if (!toRegion)
      throw new NotFoundException(`To region with id ${toRegionId} not found`);

    // ✅ From region (chiqim qiluvchi)
    fromRegion.balanceExpenseUzs =
      Number(fromRegion.balanceExpenseUzs) + Number(expenseUzs);
    fromRegion.balanceExpenseUsd =
      Number(fromRegion.balanceExpenseUsd) + Number(expenseUsd);
    fromRegion.balanceUzs = Number(fromRegion.balanceUzs) - Number(expenseUzs);
    fromRegion.balanceUsd = Number(fromRegion.balanceUsd) - Number(expenseUsd);

    // ✅ To region (kirim qiluvchi)
    toRegion.balanceIncomeUzs =
      Number(toRegion.balanceIncomeUzs) + Number(incomeUzs);
    toRegion.balanceIncomeUsd =
      Number(toRegion.balanceIncomeUsd) + Number(incomeUsd);
    toRegion.balanceUzs = Number(toRegion.balanceUzs) + Number(incomeUzs);
    toRegion.balanceUsd = Number(toRegion.balanceUsd) + Number(incomeUsd);

    await this.regionRepo.save([fromRegion, toRegion]);

    // ✅ Order yozish
    const order = this.orderRepo.create({
      phone,
      from_region: fromRegion,
      to_region: toRegion,
      incomeUzs,
      expenseUzs,
      incomeUsd,
      expenseUsd,
    });

    return this.orderRepo.save(order);
  }

  async findAll(): Promise<any[]> {
    const orders = await this.orderRepo.find({
      where: { is_deleted: false },
      relations: ['from_region', 'to_region'],
    });

    return orders.map((o) => ({
      ...o,
      flowBalanceUzs: Number(o.incomeUzs) - Number(o.expenseUzs),
      flowBalanceUsd: Number(o.incomeUsd) - Number(o.expenseUsd),
    }));
  }

  async findAllPaginated(query: PaginationQueryDto) {
    const { page, limit, search, fromDate, toDate } = query;

    const qb = this.orderRepo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.from_region', 'from_region')
      .leftJoinAndSelect('order.to_region', 'to_region')
      .where('order.is_deleted = :isDeleted', { isDeleted: false });

    // 🔍 Search (phone yoki region nomi bo‘yicha)
    if (search) {
      qb.andWhere(
        '(order.phone ILIKE :search OR from_region.name ILIKE :search OR to_region.name ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // 📅 Sana oralig‘i
    if (fromDate) {
      qb.andWhere('order.created_at >= :fromDate', { fromDate });
    }
    if (toDate) {
      qb.andWhere('order.created_at <= :toDate', { toDate });
    }

    // Pagination
    qb.skip((page - 1) * limit)
      .take(limit)
      .orderBy('order.created_at', 'DESC');

    const [items, total] = await qb.getManyAndCount();

    const data = items.map((o) => ({
      ...o,
      flowBalanceUzs: Number(o.incomeUzs) - Number(o.expenseUzs),
      flowBalanceUsd: Number(o.incomeUsd) - Number(o.expenseUsd),
    }));

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<any> {
    const order = await this.orderRepo.findOne({
      where: { id, is_deleted: false },
      relations: ['from_region', 'to_region'],
    });
    if (!order) throw new NotFoundException('Order not found');

    return {
      ...order,
      flowBalanceUzs: Number(order.incomeUzs) - Number(order.expenseUzs),
      flowBalanceUsd: Number(order.incomeUsd) - Number(order.expenseUsd),
    };
  }

  async update(id: string, dto: UpdateOrderDto): Promise<Order> {
    const order = await this.orderRepo.findOne({
      where: { id, is_deleted: false },
    });
    if (!order) throw new NotFoundException('Order not found');

    Object.assign(order, dto);
    return this.orderRepo.save(order);
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    const result = await this.orderRepo.update(id, { is_deleted: true });
    if (result.affected === 0) throw new NotFoundException('Order not found');
    return { deleted: true };
  }
}
