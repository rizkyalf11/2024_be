import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { KategoriService } from './kategori.service';
import {
  CreateKategoriDto,
  UpdateKategoriDto,
  createKategoriArrayDto,
  findAllKategori,
} from './kategori.dto';
import { JwtGuard } from '../auth/auth.guard';
import { Pagination } from 'src/utils/decorator/pagination.decorator';
import { InjectCreatedBy } from 'src/utils/decorator/inject-created_by.decorator';
import { InjectUpdatedBy } from 'src/utils/decorator/inject-updated_by.decorator';

@UseGuards(JwtGuard) //  implementasikan global guard pada semua endpont kategori memerlukan authentikasi saat request
@Controller('kategori')
export class KategoriController {
  constructor(private kategoriService: KategoriService) {}

  @Post('create')
  async create(@InjectCreatedBy() payload: CreateKategoriDto) {
    return this.kategoriService.create(payload);
  }

  @Get('list')
  async getAllCategory(@Pagination() query: findAllKategori) {
    //gunakan custom decorator yang pernah kita buat
    return this.kategoriService.getAllCategory(query);
  }

  @Put('update/:id')
  updateKategori(
    @Param('id') id: string,
    @InjectUpdatedBy() updateKategoriDto: UpdateKategoriDto,
  ) {
    return this.kategoriService.updateKategori(Number(id), updateKategoriDto);
  }

  @Post('create-bulk')
  bulkCreateKategori(@Body() payload: createKategoriArrayDto) {
    return this.kategoriService.bulkCreate(payload);
  }

  @Delete('delete/:id')
  deleteKategori(@Param('id') id: string) {
    return this.kategoriService.deleteKategori(Number(id));
  }

  @Get('detail/:id')
  getDetail(@Param('id') id: string) {
    return this.kategoriService.detailKategori(Number(id));
  }
}
