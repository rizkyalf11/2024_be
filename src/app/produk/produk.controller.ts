import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ProdukService } from './produk.service';
import {
  CreateProdukArrayDto,
  DeleteArrayDto,
  UpdateProdukDto,
  findAllProduk,
} from './produk.dto';
import { JwtGuard } from '../auth/auth.guard';
import { Pagination } from 'src/utils/decorator/pagination.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { InjectUpdatedBy } from 'src/utils/decorator/inject-updated_by.decorator';

@UseGuards(JwtGuard)
@Controller('produk')
export class ProdukController {
  constructor(private produkService: ProdukService) {}

  @Post('create-bulk')
  async createBulk(@Body() payload: CreateProdukArrayDto) {
    return this.produkService.createBulk(payload);
  }

  @Get('list')
  async findAll(@Pagination() query: findAllProduk) {
    return this.produkService.findAll(query);
  }

  @Get('detail/:id')
  findOneBook(@Param('id') id: string) {
    return this.produkService.getDetail(Number(id));
  }

  @Put('update/:id')
  updateKategori(
    @Param('id') id: string,
    @InjectUpdatedBy() updateProdukDto: UpdateProdukDto,
  ) {
    return this.produkService.updateProduk(Number(id), updateProdukDto);
  }

  @Delete('delete/:id')
  deleteKategori(@Param('id') id: string) {
    return this.produkService.deleteProduk(Number(id));
  }

  @Post('/delete-bulk')
  bulkDeleteBook(@Body() payload: DeleteArrayDto) {
    return this.produkService.bulkDelete(payload);
  }

  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: 'public/uploads',
        filename: (req, file, cb) => {
          const fileExtension = file.originalname.split('.').pop();
          cb(null, `${new Date().getTime()}.${fileExtension}`);
        },
      }),
    }),
  )
  @Post('import')
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    console.log('cfm', file.filename);
    return this.produkService.importProduk(file.filename);
  }
}
