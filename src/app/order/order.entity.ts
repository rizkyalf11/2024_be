import {
  Entity,
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../auth/auth.entity';
import { Konsumen } from '../konsumen/konsumen.entity';
import { OrderDetail } from '../order_detail/order_detail.entity';

export enum Status {
  BAYAR = 'bayar',
  BELUM = 'belum bayar',
}

@Entity()
export class Order extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  nomor_order: string;

  @Column({ nullable: false })
  tanggal_order: Date;

  @Column({
    type: 'enum',
    enum: Status,
    default: Status.BELUM,
  })
  status: Status;

  @Column({ type: 'double', precision: 18, scale: 2, nullable: false })
  total_bayar: number;

  @ManyToOne(() => Konsumen, (v) => v.order, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'konsumen_id' })
  konsumen: Konsumen;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  created_by: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'updated_by' })
  updated_by: User;

  @OneToMany(() => OrderDetail, (v) => v.order, {
    onDelete: 'CASCADE',
    cascade: ['insert', 'update'],
  })
  order_detail: OrderDetail[];

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
