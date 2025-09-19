import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Order } from '../orders/order.entity';

@Entity('regions')
export class Region {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  // Umumiy balans (real-time, minus bo‘lishi mumkin)
  @Column({ type: 'numeric', precision: 18, scale: 2, default: 0 })
  balanceUzs: number;

  @Column({ type: 'numeric', precision: 18, scale: 2, default: 0 })
  balanceUsd: number;

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

  @CreateDateColumn() created_at: Date;
  @UpdateDateColumn() updated_at: Date;

  @OneToMany(() => Order, (order) => order.from_region)
  outgoingOrders: Order[];

  @OneToMany(() => Order, (order) => order.to_region)
  incomingOrders: Order[];
}
