import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../auth/auth.entity';

@Entity()
export class Kategori extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  nama_kategori: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' }) //buat relasi many to one  dengan table user
  created_by: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'updated_by' }) //buat relasi many to one  dengan table user
  updated_by: User;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
