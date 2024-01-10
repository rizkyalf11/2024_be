import { IsInt, IsObject, IsOptional, IsNumber } from 'class-validator';

export class OrderDetailDto {
  @IsInt()
  @IsOptional()
  id?: number;

  @IsNumber()
  jumlah: number;

  @IsObject()
  produk: { id: number };

  @IsObject()
  @IsOptional()
  updated_by: { id: number };

  @IsObject()
  @IsOptional()
  created_by: { id: number };
}
