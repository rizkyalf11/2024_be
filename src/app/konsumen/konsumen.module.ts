import { Module } from '@nestjs/common';
import { KonsumenController } from './konsumen.controller';
import { KonsumenService } from './konsumen.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Konsumen } from './konsumen.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Konsumen])],
  controllers: [KonsumenController],
  providers: [KonsumenService],
})
export class KonsumenModule {}
