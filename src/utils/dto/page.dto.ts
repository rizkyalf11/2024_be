import { Type } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';

export class PageRequestDto {
  @IsInt()
  @Type(() => Number)
  page = 1;

  @IsInt()
  @Type(() => Number)
  pageSize = 10;

  @IsInt()
  @IsOptional()
  limit: any;
}
