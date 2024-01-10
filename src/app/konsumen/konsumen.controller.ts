import { Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { KonsumenService } from './konsumen.service';
import { InjectCreatedBy } from 'src/utils/decorator/inject-created_by.decorator'; //import disini
import { CreateKonsumenDto, findAllKonsumenDto } from './konsumen.dto';
import { JwtGuard } from 'src/app/auth/auth.guard';

@UseGuards(JwtGuard)
@Controller('konsumen')
export class KonsumenController {
  constructor(private konsumenService: KonsumenService) {}

  @Post('create')
  async create(@InjectCreatedBy() payload: CreateKonsumenDto) {
    return this.konsumenService.create(payload);
  }

  @Get('list')
  async findAll(@Query() query: findAllKonsumenDto) {
    return this.konsumenService.findAll(query);
  }
}
