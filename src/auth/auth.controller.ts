import { Controller, Get, Redirect, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/users/entities/user.entity';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleLogin() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @Redirect()
  googleCallback(@Req() req: Request & { user: User }) {
    const { accessToken } = this.authService.login(req.user);
    const clientUrl = this.configService.getOrThrow<string>('CLIENT_URL');
    return {
      url: `${clientUrl}?accessToken=${accessToken}`,
    };
  }
}
