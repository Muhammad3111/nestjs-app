import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Region } from './region.entity';
import { CreateRegionDto } from './dto/create-region.dto';
import { UpdateRegionDto } from './dto/update-region.dto';

@Injectable()
export class RegionsService {
  constructor(
    @InjectRepository(Region)
    private readonly regionRepo: Repository<Region>,
  ) {}

  async create(dto: CreateRegionDto): Promise<Region> {
    const region = this.regionRepo.create({
      name: dto.name,
      balanceIncomeUzs: 0,
      balanceIncomeUsd: 0,
      balanceExpenseUzs: 0,
      balanceExpenseUsd: 0,
    });
    return this.regionRepo.save(region);
  }

  async findAll(): Promise<Region[]> {
    return this.regionRepo.find({
      relations: ['outgoingOrders', 'incomingOrders'],
    });
  }

  async findOne(id: string): Promise<Region> {
    const region = await this.regionRepo.findOne({
      where: { id },
      relations: ['outgoingOrders', 'incomingOrders'],
    });
    if (!region) throw new NotFoundException('Region not found');
    return region;
  }

  async update(id: string, dto: UpdateRegionDto): Promise<Region> {
    const region = await this.findOne(id);
    Object.assign(region, dto);
    return this.regionRepo.save(region);
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    const result = await this.regionRepo.delete(id);
    if (result.affected === 0) throw new NotFoundException('Region not found');
    return { deleted: true };
  }
}
