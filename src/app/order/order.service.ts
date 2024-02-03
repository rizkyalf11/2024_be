import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import BaseResponse from 'src/utils/response/base.response';
import { Between, Like, Repository } from 'typeorm';
import { Order } from './order.entity';
import { ResponsePagination, ResponseSuccess } from 'src/interface/response';
import { CreateOrderDto, UpdateOrderDto, findAllOrderDto } from './order.dto';
import { REQUEST } from '@nestjs/core';
import { Workbook } from 'exceljs';

@Injectable()
export class OrderService extends BaseResponse {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @Inject(REQUEST) private req: any,
  ) {
    super();
  }

  generateInvoice(): string {
    return `INV` + new Date().getTime();
  }

  async createOrder(payload: CreateOrderDto): Promise<ResponseSuccess> {
    try {
      const invoice = this.generateInvoice();
      payload.nomor_order = invoice;

      console.log('ss', payload.created_by.id);

      payload.order_detail &&
        payload.order_detail.forEach((item) => {
          item.created_by = this.req.user.id;
        });

      await this.orderRepository.save({
        ...payload,
        konsumen: {
          id: payload.konsumen_id,
        },
      });

      return this._success('OK');
    } catch (err) {
      console.log('err', err);
      throw new HttpException('Ada Kesalahan', HttpStatus.UNPROCESSABLE_ENTITY);
    }
  }

  async findAll(query: findAllOrderDto): Promise<ResponsePagination> {
    const {
      page,
      pageSize,
      limit,
      nomor_order,
      dari_order_tanggal,
      sampai_order_tanggal,
      status,
      dari_total_bayar,
      sampai_total_bayar,
      nama_konsumen,
    } = query;

    const filterQuery: any = [];

    if (nomor_order) {
      filterQuery.nomor_order = Like(`%${nomor_order}%`);
    }

    if (nama_konsumen) {
      filterQuery.konsumen = {
        nama_konsumen: Like(`%${nama_konsumen}%`),
      };
    }
    if (status) {
      filterQuery.status = Like(`%${status}%`);
    }
    if (dari_total_bayar && sampai_total_bayar) {
      filterQuery.total_bayar = Between(dari_total_bayar, sampai_total_bayar);
    }
    if (dari_total_bayar && !!sampai_total_bayar === false) {
      filterQuery.total_bayar = Between(dari_total_bayar, dari_total_bayar);
    }

    if (dari_order_tanggal && sampai_order_tanggal) {
      filterQuery.tanggal_order = Between(
        dari_order_tanggal,
        sampai_order_tanggal,
      );
    }
    if (dari_order_tanggal && !!sampai_order_tanggal === false) {
      filterQuery.tanggal_order = Between(
        dari_order_tanggal,
        sampai_order_tanggal,
      );
    }

    const total = await this.orderRepository.count({
      where: filterQuery,
    });

    const result = await this.orderRepository.find({
      where: filterQuery,
      relations: [
        'created_by',
        'konsumen',
        'order_detail',
        'order_detail.produk',
      ],
      select: {
        id: true,
        nomor_order: true,
        status: true,
        total_bayar: true,
        tanggal_order: true,

        konsumen: {
          id: true,
          nama_konsumen: true,
        },
        created_by: {
          id: true,
          nama: true,
        },

        order_detail: {
          id: true,

          jumlah: true,
          produk: {
            nama_produk: true,
          },
        },
      },

      skip: limit,
      take: pageSize,
    });
    return this._pagination('OK', result, total, page, pageSize);
  }

  async findById(id: number): Promise<ResponseSuccess> {
    const result = await this.orderRepository.findOne({
      where: {
        id: id,
      },
      relations: [
        'created_by',
        'konsumen',
        'order_detail',
        'order_detail.produk',
      ],
      select: {
        id: true,
        nomor_order: true,
        status: true,
        total_bayar: true,
        tanggal_order: true,
        konsumen: {
          id: true,
          nama_konsumen: true,
        },
        created_by: {
          id: true,
          nama: true,
        },
        order_detail: {
          id: true,
          jumlah: true,
          produk: {
            id: true,
            nama_produk: true,
            harga: true,
          },
        },
      },
    });

    return this._success('OK', result);
  }

  async updateOrder(
    id: number,
    payload: UpdateOrderDto,
  ): Promise<ResponseSuccess> {
    const check = await this.orderRepository.findOne({
      where: {
        id: id,
      },
    });

    if (!check) {
      throw new HttpException('Data tidak ditemukan', HttpStatus.NOT_FOUND);
    }

    payload.order_detail &&
      payload.order_detail.forEach((item) => {
        item.created_by = this.req.user.id;
      });

    const order = await this.orderRepository.save({ ...payload, id: id });

    return this._success('OK', order);
  }

  async deleteOrder(id: number): Promise<ResponseSuccess> {
    const check = await this.orderRepository.findOne({
      where: {
        id,
      },
    });

    if (!check)
      throw new NotFoundException(`Buku dengan id ${id} tidak ditemukan`);
    await this.orderRepository.delete(id);

    return this._success('Berhasil menghapus buku');
  }

  async pdfReport(query: findAllOrderDto, res: any): Promise<any> {
    const result = await this.findAll(query);

    try {
      const workbook = new Workbook();
      const worksheet = workbook.addWorksheet('Laporan');
      worksheet.columns = [
        { header: 'No.', key: 'no', width: 10 },
        { header: 'Nomor Order', key: 'nomor_order', width: 20 },
        { header: 'Tanggal Order', key: 'tanggal_order', width: 20 },
        { header: 'Nama Produk', key: 'nama_produk', width: 20 },
        { header: 'Jumlah', key: 'jumlah', width: 20 },
        { header: 'Harga', key: 'harga', width: 20 },
        { header: 'Nama Konsumen', key: 'nama_konsumen', width: 20 },
        { header: 'Total Bayar', key: 'total_bayar', width: 20 },
        { header: 'Dibuat oleh', key: 'created_by', width: 20 },
        { header: 'Diperbaharui oleh', key: 'updated_by', width: 20 },
      ];

      const merge: { start: number; finish: number }[] = [];

      let col = 1;
      result.data.forEach((item) => {
        if (item.order_detail.length >= 1) {
          merge.push({
            start: col + 1,
            finish: col + item.order_detail.length,
          });
          item.order_detail.map((order) => {
            col = col + 1;
            worksheet.addRow({
              no: col - 1,
              nomor_order: item.nomor_order,
              tanggal_order: item.tanggal_order,
              nama_produk: order.produk.nama_produk,
              jumlah: order.jumlah,
              harga: order.produk.harga,
              nama_konsumen: item.konsumen.nama_konsumen,
              total_bayar: 12000,
              created_by: item?.created_by?.nama,
              updated_by: item?.updated_by?.nama,
            });
          });
        } else {
          col = col + 1;
          worksheet.addRow({
            no: col - 1,
            nomor_order: item.nomor_order,
            tanggal_order: item.tanggal_order,
            nama_produk: '',
            jumlah: 0,
            harga: 0,
            nama_konsumen: item.konsumen.nama_konsumen,
            total_bayar: 12000,
            created_by: item?.created_by?.nama,
            updated_by: item?.updated_by?.nama,
          });
        }
      });

      merge.forEach((item) => {
        worksheet.mergeCells(item.start, 8, item.finish, 8);
      });

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );

      return workbook.xlsx.write(res).then(function () {
        res.status(200).end();
      });
    } catch (err) {
      console.log('err', err);
      throw new HttpException('Ada Kesalahan', HttpStatus.BAD_REQUEST);
    }
  }
}
