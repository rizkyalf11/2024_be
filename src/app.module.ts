import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/typeorm.config';
import { BookModule } from './book/book.module';
import { AuthModule } from './app/auth/auth.module';
import { MailModule } from './app/mail/mail.module';
import { KategoriModule } from './app/kategori/kategori.module';
import { ProdukModule } from './app/produk/produk.module';
import { UploadController } from './app/upload/upload.controller';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { KonsumenModule } from './app/konsumen/konsumen.module';
import { UniqueValidator } from './utils/validator/unique.validator';
import { OrderModule } from './app/order/order.module';
import { OrderDetailModule } from './app/order_detail/order_detail.module';
import { ProfileModule } from './app/profile/profile.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    TypeOrmModule.forRoot(typeOrmConfig),
    BookModule,
    AuthModule,
    MailModule,
    KategoriModule,
    ProdukModule,
    KonsumenModule,
    OrderModule,
    OrderDetailModule,
    ProfileModule,
  ],
  controllers: [AppController, UploadController],
  providers: [AppService, UniqueValidator],
})
export class AppModule {}
