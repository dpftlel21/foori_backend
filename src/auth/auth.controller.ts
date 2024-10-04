import {
  Body,
  Controller,
  Post,
  Headers,
  UseGuards,
  HttpStatus,
  HttpCode,
  Get,
  Redirect,
  Query,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserRequestDto } from '../users/dto/register-user-request.dto';
import { LoginUserRequestDto } from './dto/login-user-request.dto';
import { RefreshTokenGuard } from './guard/bearer-token.guard';
import { AuthKakaoService } from './auth-kakao.service';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly authKakaoService: AuthKakaoService,
  ) {}

  @Post('register')
  register(@Body() registerUserDto: RegisterUserRequestDto) {
    return this.authService.register(registerUserDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.CREATED)
  login(@Body() loginUserDto: LoginUserRequestDto) {
    return this.authService.loginWithEmail(loginUserDto);
  }

  @Get('login/kakao')
  @Redirect()
  async kakaoLogin() {
    const kakaoAuthUrl = await this.authKakaoService.getKakaoLoginUrl();
    return { url: kakaoAuthUrl };
  }

  @Get('login/kakao/callback')
  async kakaoCallback(@Query('code') code: string, @Res() res: Response) {
    const kakaoToken = await this.authKakaoService.getKakaoAccessToken(code);
    console.log(`kakaoToken: ${kakaoToken}`);
    const userInfo = await this.authKakaoService.getKakaoUserInfo(kakaoToken);
    console.log(`userInfo: ${JSON.stringify(userInfo, null, 2)}`);

    try {
      return this.authKakaoService.loginWithKakao(userInfo);
    } catch (error) {
      return res.redirect('/login');
    }
  }

  // // 네이버 로그인 리다이렉트
  // @Get('login/naver')
  // @Redirect()
  // async naverLogin() {
  //   const naverAuthUrl = await this.authService.getNaverLoginUrl();
  //   return { url: naverAuthUrl };
  // }
  //
  // // 네이버 로그인 콜백 처리
  // @Get('login/naver/callback')
  // async naverCallback(
  //   @Query('code') code: string,
  //   @Query('state') state: string,
  // ) {
  //   // 네이버 토큰 요청
  //   const naverToken = await this.authService.getNaverAccessToken(code, state);
  //   console.log(`naverToken: ${naverToken}`);
  //
  //   // 네이버 사용자 정보 요청
  //   const userInfo = await this.authService.getNaverUserInfo(naverToken);
  //   console.log(`userInfo: ${JSON.stringify(userInfo, null, 2)}`);
  //
  //   // 사용자 정보로 로그인 처리
  //   return this.authService.loginWithNaver(userInfo);
  // }

  @Get('login/naver')
  @Post('token/access')
  @UseGuards(RefreshTokenGuard)
  postAccessToken(@Headers('authorization') rawToken: string) {
    const token = this.authService.extractTokenFromHeader(rawToken, true);
    const newToken = this.authService.rotateToken(token, false);
    return {
      accessToken: newToken,
    };
  }

  @Post('token/refresh')
  @UseGuards(RefreshTokenGuard)
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
