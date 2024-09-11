import { Body, Controller, Post, Headers } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserRequestDto } from '../users/dto/register-user-request.dto';
import { LoginUserRequestDto } from './dto/login-user-request.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() registerUserDto: RegisterUserRequestDto) {
    return this.authService.register(registerUserDto);
  }

  @Post('login')
  login(@Body() loginUserDto: LoginUserRequestDto) {
    return this.authService.loginWithEmail(loginUserDto);
  }

  @Post('token/access')
  postAccessToken(@Headers('authorization') rawToken: string) {
    const token = this.authService.extractTokenFromHeader(rawToken, true);
    const newToken = this.authService.rotateToken(token, false);
    return {
      accessToken: newToken,
    };
  }

  @Post('token/refresh')
  postRefreshToken(@Headers('authorization') rawToken: string) {
    const token = this.authService.extractTokenFromHeader(rawToken, true);
    const newToken = this.authService.rotateToken(token, true);
    return {
      refreshToken: newToken,
    };
  }

  // @Post('login')
  // login(@Headers('authorization') rawToken: string) {
  //   const getToken = this.authService.extractTokenFromHeader(rawToken, false);
  //
  //   const credentials = this.authService.decodeBasicToken(getToken);
  //
  //   return this.authService.loginWithEmail(credentials);
  // }
}
