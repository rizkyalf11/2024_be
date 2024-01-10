import { User } from 'src/app/auth/auth.entity';
import {
  Entity,
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Order } from '../order/order.entity';

@Entity()
export class Konsumen extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  nama_konsumen: string;

  @Column({ type: 'text', nullable: false })
  alamat_konsumen: string;

  @Column({ unique: true, nullable: false })
  email: string;

  @Column({ nullable: false })
  nomor_handphone: string;

  @OneToMany(() => Order, (v) => v.konsumen, {
    onDelete: 'CASCADE',
    cascade: ['insert', 'update'],
  })
  order: Order[];

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  created_by: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'updated_by' })
  updated_by: User;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
