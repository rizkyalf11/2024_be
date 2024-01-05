import { OmitType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  ValidateNested,
  Min,
  Max,
  IsOptional,
} from 'class-validator';
import { PageRequestDto } from 'src/utils/dto/page.dto';

export class BookDto {
  id: number;

  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  author: string;

  @IsInt()
  @Min(2020)
  @Max(2023)
  year: number;
}

export class CreateBookDto extends OmitType(BookDto, ['id']) {}
export class UpdateBookDto extends OmitType(BookDto, ['id']) {}

export class createBookArrayDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateBookDto)
  data: CreateBookDto[];
}

export class FindBookDto extends PageRequestDto {
  @IsOptional()
  title: string;

  @IsOptional()
  author: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  from_year: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  to_year: number;
}
