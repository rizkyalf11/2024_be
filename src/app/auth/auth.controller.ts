import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, ResetPasswordDto } from './auth.dto';
import { JwtGuard, JwtGuardRefreshToken } from './auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() payload: RegisterDto) {
    return this.authService.register(payload);
  }

  @Post('login')
  async login(@Body() payload: LoginDto) {
    return this.authService.login(payload);
  }

  @UseGuards(JwtGuard) // impelementasi guard pada route , hal ini berarti endpoint profile hanya bisa diakses jika client membawa token
  @Get('profile')
  async profile(@Req() req) {
    // hasil validate dari jwt strategy akan ditambakan pada req.user. isi object req.user akan sama dengan payload dari jwt token. Silahkan coba console.log(req.user)
    const { id } = req.user;
    console.log('usr', req.user);
    return this.authService.myProfile(id);
  }

  @UseGuards(JwtGuardRefreshToken)
  @Get('refresh-token')
  async refreshToken(@Req() req) {
    const token = req.headers.authorization.split(' ')[1];
    const id = req.headers.id;
    return this.authService.refreshToken(+id, token);
  }

  @Post('lupa-password')
  async forgotPassowrd(@Body('email') email: string) {
    console.log('email', email);
    return this.authService.forgotPassword(email);
  }

  @Post('reset-password/:user_id/:token') // url yang dibuat pada endpont harus sama dengan ketika kita membuat link pada service forgotPassword
  async resetPassword(
    @Param('user_id') user_id: string,
    @Param('token') token: string,
    @Body() payload: ResetPasswordDto,
  ) {
    return this.authService.resetPassword(+user_id, token, payload);
  }
}
