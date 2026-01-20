import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Order } from '../orders/order.entity';

@Entity('regions')
export class Region {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ unique: true })
  name: string;

  // Income balanslari
  @Column({ type: 'numeric', precision: 18, scale: 2, default: 0 })
  balanceIncomeUzs: number;

  @Column({ type: 'numeric', precision: 18, scale: 2, default: 0 })
  balanceIncomeUsd: number;

  // Expense balanslari
  @Column({ type: 'numeric', precision: 18, scale: 2, default: 0 })
  balanceExpenseUzs: number;

  @Column({ type: 'numeric', precision: 18, scale: 2, default: 0 })
  balanceExpenseUsd: number;

  // Total balanslari (income - expense)
  @Column({ type: 'numeric', precision: 18, scale: 2, default: 0 })
  totalBalanceUzs: number;

  @Column({ type: 'numeric', precision: 18, scale: 2, default: 0 })
  totalBalanceUsd: number;

  @CreateDateColumn() created_at: Date;
  @UpdateDateColumn() updated_at: Date;

  @OneToMany(() => Order, (order) => order.from_region)
  outgoingOrders: Order[];

  @OneToMany(() => Order, (order) => order.to_region)
  incomingOrders: Order[];
}
