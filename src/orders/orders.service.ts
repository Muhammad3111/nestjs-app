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

  /** number|null|undefined -> 0 ga */
  private nz(x: unknown): number {
    return Number(x ?? 0);
  }

  /**
   * Region uchun totalBalance larni qayta hisoblash
   * totalBalance = balanceIncome - balanceExpense
   */
  private updateRegionTotalBalances(region: Region): void {
    const incomeUzs = this.nz(region.balanceIncomeUzs);
    const incomeUsd = this.nz(region.balanceIncomeUsd);
    const expenseUzs = this.nz(region.balanceExpenseUzs);
    const expenseUsd = this.nz(region.balanceExpenseUsd);

    region.totalBalanceUzs = incomeUzs - expenseUzs;
    region.totalBalanceUsd = incomeUsd - expenseUsd;
  }

  /**
   * Faqat bitta valyuta ishlatilgan bo'lsa flow hisoblaydi:
   * - UZS ishlatilgan (incomeUzs/expenseUzs > 0), USD ishlatilmagan => flowBalanceUzs = incomeUzs - expenseUzs
   * - USD ishlatilgan (incomeUsd/expenseUsd > 0), UZS ishlatilmagan => flowBalanceUsd = incomeUsd - expenseUsd
   * - Aralash (UZS ham, USD ham bor) => ikkalasi ham 0
   */
  private computeFlowBalances(o: {
    incomeUzs?: number | null;
    expenseUzs?: number | null;
    incomeUsd?: number | null;
    expenseUsd?: number | null;
  }) {
    const iu = this.nz(o.incomeUzs);
    const eu = this.nz(o.expenseUzs);
    const id = this.nz(o.incomeUsd);
    const ed = this.nz(o.expenseUsd);

    const hasUzs = iu !== 0 || eu !== 0;
    const hasUsd = id !== 0 || ed !== 0;

    if (hasUzs && !hasUsd) {
      return { flowBalanceUzs: iu - eu, flowBalanceUsd: 0 };
    } else if (hasUsd && !hasUzs) {
      return { flowBalanceUzs: 0, flowBalanceUsd: id - ed };
    } else {
      // aralash yoki hammasi 0
      return { flowBalanceUzs: 0, flowBalanceUsd: 0 };
    }
  }

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

    // From region (chiqim)
    fromRegion.balanceExpenseUzs =
      this.nz(fromRegion.balanceExpenseUzs) + this.nz(expenseUzs);
    fromRegion.balanceExpenseUsd =
      this.nz(fromRegion.balanceExpenseUsd) + this.nz(expenseUsd);

    // To region (kirim)
    toRegion.balanceIncomeUzs =
      this.nz(toRegion.balanceIncomeUzs) + this.nz(incomeUzs);
    toRegion.balanceIncomeUsd =
      this.nz(toRegion.balanceIncomeUsd) + this.nz(incomeUsd);

    // Total balance larni yangilash
    this.updateRegionTotalBalances(fromRegion);
    this.updateRegionTotalBalances(toRegion);

    await this.regionRepo.save([fromRegion, toRegion]);

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
      ...this.computeFlowBalances(o),
    }));
  }

  async findAllPaginated(query: PaginationQueryDto) {
    const { page, limit, search, fromDate, toDate } = query;

    const qb = this.orderRepo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.from_region', 'from_region')
      .leftJoinAndSelect('order.to_region', 'to_region')
      .where('order.is_deleted = :isDeleted', { isDeleted: false });

    if (search) {
      qb.andWhere(
        '(order.phone ILIKE :search OR from_region.name ILIKE :search OR to_region.name ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (fromDate) qb.andWhere('order.created_at >= :fromDate', { fromDate });
    if (toDate) qb.andWhere('order.created_at <= :toDate', { toDate });

    qb.skip((page - 1) * limit)
      .take(limit)
      .orderBy('order.created_at', 'DESC');

    const [items, total] = await qb.getManyAndCount();

    const data = items.map((o) => ({
      ...o,
      ...this.computeFlowBalances(o),
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
      ...this.computeFlowBalances(order),
    };
  }

  async update(id: string, dto: UpdateOrderDto): Promise<Order> {
    const order = await this.orderRepo.findOne({
      where: { id, is_deleted: false },
      relations: ['from_region', 'to_region'],
    });
    if (!order) throw new NotFoundException('Order not found');

    const prevFromRegion = order.from_region;
    const prevToRegion = order.to_region;

    const prevExpenseUzs = this.nz(order.expenseUzs);
    const prevExpenseUsd = this.nz(order.expenseUsd);
    const prevIncomeUzs = this.nz(order.incomeUzs);
    const prevIncomeUsd = this.nz(order.incomeUsd);

    let nextFromRegion = prevFromRegion;
    let nextToRegion = prevToRegion;

    if (dto.fromRegionId !== undefined) {
      if (!dto.fromRegionId) {
        throw new NotFoundException('From region id is required');
      }
      if (prevFromRegion?.id !== dto.fromRegionId) {
        const region = await this.regionRepo.findOne({
          where: { id: dto.fromRegionId },
        });
        if (!region)
          throw new NotFoundException(
            `From region with id ${dto.fromRegionId} not found`,
          );
        nextFromRegion = region;
      }
    }

    if (dto.toRegionId !== undefined) {
      if (!dto.toRegionId) {
        throw new NotFoundException('To region id is required');
      }
      if (prevToRegion?.id !== dto.toRegionId) {
        const region = await this.regionRepo.findOne({
          where: { id: dto.toRegionId },
        });
        if (!region)
          throw new NotFoundException(
            `To region with id ${dto.toRegionId} not found`,
          );
        nextToRegion = region;
      }
    }

    if (prevFromRegion) {
      prevFromRegion.balanceExpenseUzs =
        this.nz(prevFromRegion.balanceExpenseUzs) - prevExpenseUzs;
      prevFromRegion.balanceExpenseUsd =
        this.nz(prevFromRegion.balanceExpenseUsd) - prevExpenseUsd;

      // Total balance ni yangilash
      this.updateRegionTotalBalances(prevFromRegion);
    }

    if (prevToRegion) {
      prevToRegion.balanceIncomeUzs =
        this.nz(prevToRegion.balanceIncomeUzs) - prevIncomeUzs;
      prevToRegion.balanceIncomeUsd =
        this.nz(prevToRegion.balanceIncomeUsd) - prevIncomeUsd;

      // Total balance ni yangilash
      this.updateRegionTotalBalances(prevToRegion);
    }

    if (dto.phone !== undefined) {
      order.phone = dto.phone;
    }
    if (dto.incomeUzs !== undefined) {
      order.incomeUzs = dto.incomeUzs;
    }
    if (dto.expenseUzs !== undefined) {
      order.expenseUzs = dto.expenseUzs;
    }
    if (dto.incomeUsd !== undefined) {
      order.incomeUsd = dto.incomeUsd;
    }
    if (dto.expenseUsd !== undefined) {
      order.expenseUsd = dto.expenseUsd;
    }

    order.from_region = nextFromRegion ?? null;
    order.to_region = nextToRegion ?? null;

    const nextExpenseUzs = this.nz(order.expenseUzs);
    const nextExpenseUsd = this.nz(order.expenseUsd);
    const nextIncomeUzs = this.nz(order.incomeUzs);
    const nextIncomeUsd = this.nz(order.incomeUsd);

    if (nextFromRegion) {
      nextFromRegion.balanceExpenseUzs =
        this.nz(nextFromRegion.balanceExpenseUzs) + nextExpenseUzs;
      nextFromRegion.balanceExpenseUsd =
        this.nz(nextFromRegion.balanceExpenseUsd) + nextExpenseUsd;

      // Total balance ni yangilash
      this.updateRegionTotalBalances(nextFromRegion);
    }

    if (nextToRegion) {
      nextToRegion.balanceIncomeUzs =
        this.nz(nextToRegion.balanceIncomeUzs) + nextIncomeUzs;
      nextToRegion.balanceIncomeUsd =
        this.nz(nextToRegion.balanceIncomeUsd) + nextIncomeUsd;

      // Total balance ni yangilash
      this.updateRegionTotalBalances(nextToRegion);
    }

    const regionsMap = new Map<string, Region>();
    [prevFromRegion, prevToRegion, nextFromRegion, nextToRegion]
      .filter((region): region is Region => Boolean(region))
      .forEach((region) => regionsMap.set(region.id, region));

    const regionsToPersist = Array.from(regionsMap.values());
    if (regionsToPersist.length) {
      await this.regionRepo.save(regionsToPersist);
    }

    return this.orderRepo.save(order);
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    const order = await this.orderRepo.findOne({
      where: { id, is_deleted: false },
      relations: ['from_region', 'to_region'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const { from_region: fromRegion, to_region: toRegion } = order;

    if (fromRegion) {
      fromRegion.balanceExpenseUzs =
        Number(fromRegion.balanceExpenseUzs) - Number(order.expenseUzs);
      fromRegion.balanceExpenseUsd =
        Number(fromRegion.balanceExpenseUsd) - Number(order.expenseUsd);

      // Total balance ni yangilash
      this.updateRegionTotalBalances(fromRegion);
    }

    if (toRegion) {
      toRegion.balanceIncomeUzs =
        Number(toRegion.balanceIncomeUzs) - Number(order.incomeUzs);
      toRegion.balanceIncomeUsd =
        Number(toRegion.balanceIncomeUsd) - Number(order.incomeUsd);

      // Total balance ni yangilash
      this.updateRegionTotalBalances(toRegion);
    }

    const regionsToUpdate = [fromRegion, toRegion].filter(
      (region): region is Region => Boolean(region),
    );

    const uniqueRegions = Array.from(
      new Map(regionsToUpdate.map((region) => [region.id, region])).values(),
    );

    if (uniqueRegions.length) {
      await this.regionRepo.save(uniqueRegions);
    }

    order.is_deleted = true;
    await this.orderRepo.save(order);

    return { deleted: true };
  }
}
