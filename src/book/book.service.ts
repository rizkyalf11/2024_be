import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Book } from './book.entity';
import { Between, Like, Repository } from 'typeorm';
import {
  CreateBookDto,
  FindBookDto,
  UpdateBookDto,
  createBookArrayDto,
} from './book.dto';
import { ResponsePagination, ResponseSuccess } from 'src/interface/response';
import BaseResponse from 'src/utils/response/base.response';

@Injectable()
export class BookService extends BaseResponse {
  constructor(
    @InjectRepository(Book) private readonly bookRepo: Repository<Book>,
  ) {
    super();
  }

  async createBook(createBookDto: CreateBookDto): Promise<ResponseSuccess> {
    const { author, title, year } = createBookDto;

    try {
      await this.bookRepo.save({
        author,
        title,
        year,
      });

      return this._success('Berhasil Menyimpan Data');
    } catch (err) {
      throw new HttpException('Ada kesalahan', HttpStatus.BAD_REQUEST);
    }
  }

  async getAllBooks(query: FindBookDto): Promise<ResponsePagination> {
    const { page, pageSize, limit, author, from_year, title, to_year } = query;

    console.log('qwy', query);
    const total = await this.bookRepo.count();

    const filter: { [key: string]: any } = {};

    if (title) {
      filter.title = Like(`%${title}%`);
    }
    if (author) {
      filter.author = Like(`%${author}%`);
    }

    if (from_year && to_year) {
      filter.year = Between(from_year, to_year);
    }

    if (from_year && !!to_year === false) {
      filter.year = Between(from_year, from_year);
    }

    const result = await this.bookRepo.find({
      where: filter,
      skip: limit,
      take: pageSize,
    });

    return this._pagination('OK', result, total, page, pageSize);
  }

  async getDetail(id: number): Promise<ResponseSuccess> {
    const detailBook = await this.bookRepo.findOne({
      where: {
        id,
      },
    });

    if (detailBook === null) {
      throw new NotFoundException(`Buku dengan id ${id} tidak ditemukan`);
    }
    return this._success('Berhasil Mendapatkan Buku', detailBook);
  }

  async updateBook(
    id: number,
    updateBookDto: UpdateBookDto,
  ): Promise<ResponseSuccess> {
    const check = await this.bookRepo.findOne({
      where: {
        id,
      },
    });

    if (!check)
      throw new NotFoundException(`Buku dengan id ${id} tidak ditemukan`);

    const update = await this.bookRepo.save({ ...updateBookDto, id: id });

    return this._success('Berhasil MengUpdate Data', update);
  }

  async deleteBook(id: number): Promise<ResponseSuccess> {
    const check = await this.bookRepo.findOne({
      where: {
        id,
      },
    });

    if (!check)
      throw new NotFoundException(`Buku dengan id ${id} tidak ditemukan`);

    await this.bookRepo.delete(id);

    return this._success('Berhasil Menghapus Buku');
  }

  async bulkCreate(payload: createBookArrayDto): Promise<ResponseSuccess> {
    try {
      let berhasil = 0;
      let gagal = 0;
      await Promise.all(
        payload.data.map(async (data) => {
          try {
            await this.bookRepo.save(data);

            berhasil += 1;
          } catch {
            gagal += 1;
          }
        }),
      );

      return this._success(`Berhasil menyimpan ${berhasil} dan gagal ${gagal}`);
    } catch {
      throw new HttpException('Ada Kesalahan', HttpStatus.BAD_REQUEST);
    }
  }
}
