import { Controller, Get, Query, Redirect, Res } from '@nestjs/common';
import { SocialAccountsService } from './social-accounts.service';
import { Response } from 'express';
import { AuthKakaoService } from '../auth/auth-kakao.service';

@Controller('social-accounts')
export class SocialAccountsController {
  constructor(
    private readonly socialAccountsService: SocialAccountsService,
    private readonly authKakaoService: AuthKakaoService,
  ) {}

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
}
