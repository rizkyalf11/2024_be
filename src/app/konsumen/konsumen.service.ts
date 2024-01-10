import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import BaseResponse from 'src/utils/response/base.response';
import { Konsumen } from './konsumen.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { ResponsePagination, ResponseSuccess } from 'src/interface/response';
import { CreateKonsumenDto, findAllKonsumenDto } from './konsumen.dto';

@Injectable()
export class KonsumenService extends BaseResponse {
  constructor(
    @InjectRepository(Konsumen)
    private readonly konsumenRepository: Repository<Konsumen>,
  ) {
    super();
  }

  async create(payload: CreateKonsumenDto): Promise<ResponseSuccess> {
    try {
      await this.konsumenRepository.save(payload);

      return this._success('OK');
    } catch (err) {
      console.log('err', err);
      throw new HttpException('Ada Kesalahan', HttpStatus.UNPROCESSABLE_ENTITY);
    }
  }

  async findAll(query: findAllKonsumenDto): Promise<ResponsePagination> {
    const { page, pageSize, limit, keyword } = query;

    const filterKeyword = [];

    if (keyword) {
      filterKeyword.push(
        {
          nama_konsumen: Like(`%${keyword}%`),
        },
        {
          alamat_konsumen: Like(`%${keyword}%`),
        },
        {
          email: Like(`%${keyword}%`),
        },
        {
          nomor_handphone: Like(`%${keyword}%`),
        },
      );
    }

    const total = await this.konsumenRepository.count({
      where: filterKeyword,
    });

    const result = await this.konsumenRepository.find({
      where: filterKeyword,
      relations: ['created_by', 'updated_by'],
      select: {
        id: true,
        nama_konsumen: true,
        email: true,
        nomor_handphone: true,
        alamat_konsumen: true,

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
}
