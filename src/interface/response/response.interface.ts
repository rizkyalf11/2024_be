import { HttpStatus } from '@nestjs/common';

export interface ResponseSuccess {
  statusCode?: HttpStatus;
  status: string;
  message: string;
  data?: any;
}

export interface ResponsePagination extends ResponseSuccess {
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPage: number | null;
  };
}
