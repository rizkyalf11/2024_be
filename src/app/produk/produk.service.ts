import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import BaseResponse from 'src/utils/response/base.response';
import { Produk } from './produk.entity';
import { Between, Like, Repository } from 'typeorm';
import {
  CreateProdukArrayDto,
  DeleteArrayDto,
  findAllProduk,
  UpdateProdukDto,
} from './produk.dto';
import { ResponsePagination, ResponseSuccess } from 'src/interface/response';
import * as fs from 'fs';
import { Workbook } from 'exceljs';

@Injectable()
export class ProdukService extends BaseResponse {
  constructor(
    @InjectRepository(Produk)
    private readonly produkRepository: Repository<Produk>,
    @Inject(REQUEST) private req: any,
  ) {
    super();
  }

  async createBulk(payload: CreateProdukArrayDto): Promise<ResponseSuccess> {
    try {
      let berhasil = 0;
      let gagal = 0;
      await Promise.all(
        payload.data.map(async (data) => {
          const dataSave = {
            ...data,
            kategori: {
              id: data.kategori_id,
            },
            created_by: {
              id: this.req.user.id,
            },
          };

          try {
            await this.produkRepository.save(dataSave);

            berhasil += 1;
          } catch (err) {
            console.log('err', err);
            gagal += 1;
          }
        }),
      );

      return this._success(`Berhasil menyimpan ${berhasil} dan gagal ${gagal}`);
    } catch (err) {
      console.log('err', err);
      throw new HttpException('Ada Kesalahan', HttpStatus.BAD_REQUEST);
    }
  }

  async updateProduk(
    id: number,
    updateProdukDto: UpdateProdukDto,
  ): Promise<ResponseSuccess> {
    const check = await this.produkRepository.findOne({
      where: {
        id,
      },
    });

    if (!check)
      throw new NotFoundException(`Produk deengan id ${id} tidak ditemukan`);

    const update = await this.produkRepository.save({
      ...updateProdukDto,
      id: id,
    });

    return this._success('Berhasil MengUpdate Data', update);
  }

  async deleteProduk(id: number): Promise<ResponseSuccess> {
    const check = await this.produkRepository.findOne({
      where: {
        id,
      },
    });

    if (!check)
      throw new NotFoundException(`Produk dengan id ${id} tidak ditemukan`);

    await this.produkRepository.delete(id);

    return this._success('Berhasil Menghapus');
  }

  async bulkDelete(payload: DeleteArrayDto): Promise<ResponseSuccess> {
    try {
      let berhasil = 0;
      let gagal = 0;
      await Promise.all(
        payload.delete.map(async (data) => {
          try {
            const check = await this.produkRepository.findOne({
              where: {
                id: Number(data),
              },
            });

            if (!check) {
              gagal += 1;
            } else {
              await this.produkRepository.delete(data);
              berhasil += 1;
            }
          } catch {
            gagal += 1;
          }
        }),
      );

      return {
        status: 'Success',
        message: `Berhasil menghapus ${berhasil} dan gagal ${gagal}`,
      };
    } catch {
      throw new HttpException('Ada Kesalahan', HttpStatus.BAD_REQUEST);
    }
  }

  async findAll(query: findAllProduk): Promise<ResponsePagination> {
    const {
      page,
      pageSize,
      limit,
      nama_produk,
      dari_harga,
      sampai_harga,
      deskripsi_produk,
      keyword,
      nama_kategori,
    } = query;

    const filterQuery: { [key: string]: any } = {};
    const filterKeyword = [];

    if (keyword) {
      filterKeyword.push(
        {
          nama_produk: Like(`%${keyword}%`),
        },
        {
          harga: Like(`%${keyword}%`),
        },
        {
          deskripsi_produk: Like(`%${keyword}%`),
        },
        {
          kategori: {
            nama_kategori: Like(`%${keyword}%`),
          },
        },
      );
    } else {
      if (deskripsi_produk) {
        filterQuery.deskripsi_produk = Like(`%${deskripsi_produk}%`);
      }
      if (nama_kategori) {
        filterQuery.kategori = {
          nama_kategori: Like(`%${nama_kategori}%`),
        };
      }
      if (nama_produk) {
        filterQuery.nama_produk = Like(`%${nama_produk}%`);
      }
      if (dari_harga && sampai_harga) {
        filterQuery.harga = Between(dari_harga, sampai_harga);
      }
      if (dari_harga && !!sampai_harga === false) {
        filterQuery.harga = Between(dari_harga, dari_harga);
      }
    }

    const total = await this.produkRepository.count({
      where: keyword ? filterKeyword : filterQuery,
    });

    const result = await this.produkRepository.find({
      where: keyword ? filterKeyword : filterQuery,
      relations: ['created_by', 'updated_by', 'kategori'],
      select: {
        id: true,
        nama_produk: true,
        deskripsi_produk: true,
        stok: true,
        harga: true,
        kategori: {
          id: true,
          nama_kategori: true,
        },
        created_by: {
          id: true,
          nama: true,
        },
        updated_by: {
          id: true,
          nama: true,
        },
      },
      skip: limit,
      take: pageSize,
    });
    return this._pagination('OK', result, total, page, pageSize);
  }

  async importProduk(filename: string): Promise<ResponseSuccess> {
    const filePath = `public/uploads/${filename}`; //untuk mendapatkan lokasi file excel di upload
    const workbook = new Workbook();
    const result = await workbook.xlsx
      .readFile(filePath)
      .then(async (workbook) => {
        const ws = workbook.getWorksheet('Laporan'); // mengambil sheet Laporan

        const produks = [];

        ws.eachRow((row) => {
          // Iterasi semua baris  pada excel
          const rowData = [];
          row.eachCell((cell) => {
            // iterasi semua cell pada setiap baris
            rowData.push(cell.value);
          });
          produks.push(rowData);
        });

        console.log('produk', produks);
        produks.shift(); // menghapus baris pertama
        const payload = [];

        produks.forEach((row) => {
          //iterasi untuk membuat payload untuk disimpan ke db sesuai CreateProdukDto
          console.log('rl', row);
          const mapel = {
            barcode: row[1],
            nama_produk: row[2],
            deskripsi_produk: row[3],
            harga: row[4],
            stok: row[5],
            kategori_id: row[6],
          };

          payload.push(mapel);
        });

        console.log('py', payload);

        const response = await this.createBulk({
          // create data secara bulk ke database
          data: payload,
        });

        fs.unlinkSync(filePath); // hapus file excel
        return response;
      })
      .catch((err) => {
        console.log(err);
        throw new HttpException('Ada Kesalahan', HttpStatus.BAD_GATEWAY);
      });

    return this._success(result.message);
  }

  async getDetail(id: number): Promise<ResponseSuccess> {
    const detailBook = await this.produkRepository.findOne({
      where: {
        id,
      },
    });

    if (detailBook === null) {
      throw new NotFoundException(`Produk dengan id ${id} tidak ditemukan`);
    }
    return this._success('Berhasil Mendapatkan Produk', detailBook);
  }
}
