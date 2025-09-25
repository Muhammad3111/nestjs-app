import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Region } from '../regions/region.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  phone: string;

  @ManyToOne(() => Region, (region) => region.outgoingOrders, {
    eager: false,
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'from_region_id' })
  from_region: Region | null;

  @ManyToOne(() => Region, (region) => region.incomingOrders, {
    eager: false,
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'to_region_id' })
  to_region: Region | null;

  // UZS
  @Column('numeric', { precision: 18, scale: 2, default: 0 })
  incomeUzs: number;

  @Column('numeric', { precision: 18, scale: 2, default: 0 })
  expenseUzs: number;

  // USD
  @Column('numeric', { precision: 18, scale: 2, default: 0 })
  incomeUsd: number;

  @Column('numeric', { precision: 18, scale: 2, default: 0 })
  expenseUsd: number;

  @CreateDateColumn() created_at: Date;
  @UpdateDateColumn() updated_at: Date;

  @Column({ default: false })
  is_deleted: boolean;
}
