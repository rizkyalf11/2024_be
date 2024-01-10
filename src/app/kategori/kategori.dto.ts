import { OmitType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { PageRequestDto } from 'src/utils/dto/page.dto';

export class KategoriDto {
  @IsInt()
  id?: number;

  @IsString()
  nama_kategori: string;

  @IsObject()
  @IsOptional()
  created_by: { id: number };

  @IsObject()
  @IsOptional()
  updated_by: { id: number };
}

export class CreateKategoriDto extends OmitType(KategoriDto, [
  'id',
  'updated_by',
]) {}

export class UpdateKategoriDto extends OmitType(KategoriDto, [
  'id',
  'created_by',
]) {}

export class findAllKategori extends PageRequestDto {
  @IsString()
  @IsOptional()
  nama_kategori: string;
}

export class createKategoriArrayDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateKategoriDto)
  data: CreateKategoriDto[];
}
