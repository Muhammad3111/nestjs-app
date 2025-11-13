import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Region } from './region.entity';
import { CreateRegionDto } from './dto/create-region.dto';
import { UpdateRegionDto } from './dto/update-region.dto';
import { PaginationQueryDto } from '../orders/dto/pagination-query.dto';

@Injectable()
export class RegionsService {
  constructor(
    @InjectRepository(Region)
    private readonly regionRepo: Repository<Region>,
  ) {}

  private toNumber(value: unknown): number {
    if (value === null || value === undefined) return 0;
    // Agar DB string bo'lsa va minglik ajratgich yoki vergul bo'lsa tozalaymiz
    if (typeof value === 'string') {
      const cleaned = value.replace(/\s+/g, '').replace(/,/g, '.');
      const n = Number(cleaned);
      return Number.isNaN(n) ? 0 : n;
    }
    if (typeof value === 'number') return value;
    // BigInt yoki boshqa typelar uchun
    try {
      return Number(value as any) || 0;
    } catch {
      return 0;
    }
  }

  /**
   * Total balance hisoblaydigan helper method
   * totalBalance = balanceIncome - balanceExpense
   */
  private calculateTotalBalance(region: {
    balanceIncomeUzs?: number;
    balanceIncomeUsd?: number;
    balanceExpenseUzs?: number;
    balanceExpenseUsd?: number;
  }): { totalBalanceUzs: number; totalBalanceUsd: number } {
    const incomeUzs = this.toNumber(region.balanceIncomeUzs);
    const incomeUsd = this.toNumber(region.balanceIncomeUsd);
    const expenseUzs = this.toNumber(region.balanceExpenseUzs);
    const expenseUsd = this.toNumber(region.balanceExpenseUsd);

    return {
      totalBalanceUzs: incomeUzs - expenseUzs,
      totalBalanceUsd: incomeUsd - expenseUsd,
    };
  }

  async create(dto: CreateRegionDto): Promise<Region> {
    const region = this.regionRepo.create({
      name: dto.name,
      balanceIncomeUzs: 0,
      balanceIncomeUsd: 0,
      balanceExpenseUzs: 0,
      balanceExpenseUsd: 0,
      totalBalanceUzs: 0,
      totalBalanceUsd: 0,
    });
    return this.regionRepo.save(region);
  }

  async findAll(): Promise<Region[]> {
    return this.regionRepo.find();
  }

  async findAllPaginated(query: PaginationQueryDto) {
    const { page, limit, search } = query;

    const qb = this.regionRepo.createQueryBuilder('region');

    if (search) {
      qb.andWhere('region.name ILIKE :search', { search: `%${search}%` });
    }

    qb.skip((page - 1) * limit)
      .take(limit)
      .orderBy('region.name', 'ASC');

    const [items, total] = await qb.getManyAndCount();

    return {
      data: items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Region> {
    const region = await this.regionRepo.findOne({
      where: { id },
    });
    if (!region) throw new NotFoundException('Region not found');
    return region;
  }

  async update(id: string, dto: UpdateRegionDto): Promise<Region> {
    const region = await this.findOne(id);

    // Coerce existing DB values to numbers (TypeORM numeric may return strings)
    region.balanceIncomeUzs = this.toNumber(region.balanceIncomeUzs);
    region.balanceIncomeUsd = this.toNumber(region.balanceIncomeUsd);
    region.balanceExpenseUzs = this.toNumber(region.balanceExpenseUzs);
    region.balanceExpenseUsd = this.toNumber(region.balanceExpenseUsd);
    region.totalBalanceUzs = this.toNumber(region.totalBalanceUzs);
    region.totalBalanceUsd = this.toNumber(region.totalBalanceUsd);

    if (dto.name !== undefined) {
      region.name = dto.name;
    }

    if (dto.balanceIncomeUzs !== undefined) {
      region.balanceIncomeUzs = this.toNumber(dto.balanceIncomeUzs);
    }

    if (dto.balanceIncomeUsd !== undefined) {
      region.balanceIncomeUsd = this.toNumber(dto.balanceIncomeUsd);
    }

    if (dto.balanceExpenseUzs !== undefined) {
      region.balanceExpenseUzs = this.toNumber(dto.balanceExpenseUzs);
    }

    if (dto.balanceExpenseUsd !== undefined) {
      region.balanceExpenseUsd = this.toNumber(dto.balanceExpenseUsd);
    }

    // Recalculate totals
    const totalBalances = this.calculateTotalBalance({
      balanceIncomeUzs: region.balanceIncomeUzs,
      balanceIncomeUsd: region.balanceIncomeUsd,
      balanceExpenseUzs: region.balanceExpenseUzs,
      balanceExpenseUsd: region.balanceExpenseUsd,
    });

    region.totalBalanceUzs = totalBalances.totalBalanceUzs;
    region.totalBalanceUsd = totalBalances.totalBalanceUsd;

    // Override if manually provided
    if (dto.totalBalanceUzs !== undefined) {
      region.totalBalanceUzs = this.toNumber(dto.totalBalanceUzs);
    }
    if (dto.totalBalanceUsd !== undefined) {
      region.totalBalanceUsd = this.toNumber(dto.totalBalanceUsd);
    }

    const savedRegion = await this.regionRepo.save(region);

    return savedRegion;
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    const result = await this.regionRepo.delete(id);
    if (result.affected === 0) throw new NotFoundException('Region not found');
    return { deleted: true };
  }
}
