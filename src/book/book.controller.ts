import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { BookService } from './book.service';
import {
  CreateBookDto,
  FindBookDto,
  UpdateBookDto,
  createBookArrayDto,
} from './book.dto';
import { Pagination } from 'src/utils/decorator/pagination.decorator';

@Controller('book')
export class BookController {
  constructor(private bookService: BookService) {}

  @Post('/create')
  createBook(@Body() payload: CreateBookDto) {
    return this.bookService.createBook(payload);
  }

  @Get('/get-all')
  getAllBooks(@Pagination() findBookDto: FindBookDto) {
    return this.bookService.getAllBooks(findBookDto);
  }

  @Get('detail/:id')
  findOneBook(@Param('id') id: string) {
    return this.bookService.getDetail(Number(id));
  }

  @Put('update/:id')
  updateBook(@Param('id') id: string, @Body() updateBookDto: UpdateBookDto) {
    return this.bookService.updateBook(Number(id), updateBookDto);
  }

  @Delete('delete/:id')
  deleteBook(@Param('id') id: string) {
    return this.bookService.deleteBook(+id);
  }

  @Post('/create/bulk')
  bulkCreateBook(@Body() payload: createBookArrayDto) {
    return this.bookService.bulkCreate(payload);
  }
}
