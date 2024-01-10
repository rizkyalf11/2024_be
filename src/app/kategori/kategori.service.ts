import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import BaseResponse from 'src/utils/response/base.response';
import { Kategori } from './kategori.entity';
import {
  CreateKategoriDto,
  UpdateKategoriDto,
  createKategoriArrayDto,
  findAllKategori,
} from './kategori.dto';
import { ResponsePagination, ResponseSuccess } from 'src/interface/response';
import { Like, Repository } from 'typeorm';
import { REQUEST } from '@nestjs/core';

@Injectable()
export class KategoriService extends BaseResponse {
  constructor(
    @InjectRepository(Kategori)
    private readonly kategoriRepo: Repository<Kategori>,
    @Inject(REQUEST) private req: any, // inject request agar bisa mengakses req.user.id dari  JWT token pada service
  ) {
    super();
  }

  async create(payload: CreateKategoriDto): Promise<ResponseSuccess> {
    try {
      await this.kategoriRepo.save(payload);

      return this._success('OK', payload.created_by.id);
    } catch {
      throw new HttpException('Ada Kesalahan', HttpStatus.UNPROCESSABLE_ENTITY);
    }
  }

  async getAllCategory(query: findAllKategori): Promise<ResponsePagination> {
    const { page, pageSize, limit, nama_kategori } = query;

    const filterQuery: { [key: string]: any } = {};

    if (nama_kategori) {
      filterQuery.nama_kategori = Like(`%${nama_kategori}%`);
    }
    const total = await this.kategoriRepo.count({
      where: filterQuery,
    });
    const result = await this.kategoriRepo.find({
      where: filterQuery,
      relations: ['created_by', 'updated_by'], // relasi yang aka ditampilkan saat menampilkan list kategori
      select: {
        // pilih data mana saja yang akan ditampilkan dari tabel kategori
        id: true,
        nama_kategori: true,
        created_by: {
          id: true, // pilih field  yang akan ditampilkan dari tabel user
          nama: true,
        },
        updated_by: {
          id: true, // pilih field yang akan ditampilkan dari tabel user
          nama: true,
        },
      },
      skip: limit,
      take: pageSize,
    });

    return this._pagination('OK', result, total, page, pageSize);
  }

  async updateKategori(
    id: number,
    updateKategoriDto: UpdateKategoriDto,
  ): Promise<ResponseSuccess> {
    const check = await this.kategoriRepo.findOne({
      where: {
        id,
      },
    });

    if (!check)
      throw new NotFoundException(`Kategori deengan id ${id} tidak ditemukan`);

    const update = await this.kategoriRepo.save({
      ...updateKategoriDto,
      id: id,
    });

    return this._success('Berhasil MengUpdate Data', update);
  }

  async bulkCreate(payload: createKategoriArrayDto): Promise<ResponseSuccess> {
    try {
      let berhasil = 0;
      let gagal = 0;

      await Promise.all(
        payload.data.map(async (data) => {
          try {
            await this.kategoriRepo.save(data);

            berhasil += 1;
          } catch (error) {
            gagal += 1;
          }
        }),
      );

      return this._success(`Berhasil menyimpan ${berhasil} dan gagal ${gagal}`);
    } catch (error) {
      throw new HttpException('Ada Kesalahan', HttpStatus.BAD_REQUEST);
    }
  }

  async deleteKategori(id: number): Promise<ResponseSuccess> {
    const check = await this.kategoriRepo.findOne({
      where: {
        id,
      },
    });

    if (!check)
      throw new NotFoundException(`Kategori dengan id ${id} tidak ditemukan`);

    await this.kategoriRepo.delete(id);

    return this._success('Berhasil Menghapus');
  }

  async detailKategori(id: number): Promise<ResponseSuccess> {
    const check = await this.kategoriRepo.findOne({
      where: {
        id,
      },
      relations: ['created_by', 'updated_by'],
      select: {
        id: true,
        nama_kategori: true,
        created_by: {
          id: true, // pilih field  yang akan ditampilkan dari tabel user
          nama: true,
        },
        updated_by: {
          id: true, // pilih field yang akan ditampilkan dari tabel user
          nama: true,
        },
      },
    });

    if (!check)
      throw new NotFoundException(
        `Kategori dengan id ${id} tidak dapaat ditemukan`,
      );

    return this._success('Kategori Berhasil Ditemukan', check);
  }
}
