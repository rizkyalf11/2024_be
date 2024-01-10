import { OmitType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { PageRequestDto } from 'src/utils/dto/page.dto';
import { IsUnique } from 'src/utils/validator/unique.validator';
import { Konsumen } from './konsumen.entity';

export class KonsumenDto {
  @IsInt()
  id: number;

  @IsString()
  @IsNotEmpty()
  nama_konsumen: string;

  @IsString()
  @IsNotEmpty()
  alamat_konsumen: string;

  @IsString()
  @IsEmail()
  @IsUnique([Konsumen, 'email'])
  email: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(13)
  @MinLength(9)
  nomor_handphone: string;

  @IsObject()
  @IsOptional()
  updated_by: { id: number };
  @IsObject()
  @IsOptional()
  created_by: { id: number };
}

export class CreateKonsumenDto extends OmitType(KonsumenDto, [
  'id',
  'updated_by',
]) {}

export class UpdateKonsumenDto extends OmitType(KonsumenDto, ['created_by']) {}
export class CreateKonsumenArrayDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateKonsumenDto)
  data: CreateKonsumenDto[];
}
export class findAllKonsumenDto extends PageRequestDto {
  @IsString()
  @IsOptional()
  nama_Konsumen: string;

  @IsString()
  @IsOptional()
  email: string;

  @IsString()
  @IsOptional()
  nomor_handphone: string;

  @IsString()
  @IsOptional()
  keyword: string;
}
