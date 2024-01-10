import { OmitType, PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
  IsIn,
  IsNumber,
  IsDate,
} from 'class-validator';
import { PageRequestDto } from 'src/utils/dto/page.dto';
import { Status } from './order.entity';
import { OrderDetailDto } from '../order_detail/order_detail.dto';

export class OrderDto {
  @IsInt()
  id: number;

  @IsString()
  @IsOptional()
  nomor_order: string;

  @IsDate()
  @IsNotEmpty()
  tanggal_order: Date;

  @IsString()
  @IsNotEmpty()
  @IsIn([Status.BAYAR, Status.BELUM])
  status: Status;

  @IsNumber()
  @IsNotEmpty()
  total_bayar: number;

  @IsNumber()
  @IsNotEmpty()
  konsumen_id: number;

  @IsObject()
  @IsOptional()
  updated_by: { id: number };

  @IsObject()
  @IsOptional()
  created_by: { id: number };

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderDetailDto)
  order_detail: OrderDetailDto[];
}

export class CreateOrderDto extends OmitType(OrderDto, ['id', 'updated_by']) {}

export class UpdateOrderDto extends PartialType(OrderDto) {
  @IsInt()
  @IsNotEmpty()
  id: number;
}
export class CreateOrderArrayDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderDto)
  data: CreateOrderDto[];
}
export class findAllOrderDto extends PageRequestDto {
  @IsString()
  @IsOptional()
  nomor_order: string;

  @IsString()
  @IsOptional()
  nama_konsumen: string;

  @IsString()
  @IsOptional()
  dari_order_tanggal: Date;

  @IsString()
  @IsOptional()
  sampai_order_tanggal: Date;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  dari_total_bayar: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  sampai_total_bayar: number;

  @IsString()
  @IsOptional()
  status: string;
}
