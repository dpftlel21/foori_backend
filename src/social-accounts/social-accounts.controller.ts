import {
  Controller,
  Get,
  Query,
  Redirect,
  Res,
  UseGuards,
} from '@nestjs/common';
import { SocialAccountsService } from './social-accounts.service';
import { Response } from 'express';
import { AuthKakaoService } from '../auth/auth-kakao.service';
import { AccessTokenGuard } from '../auth/guard/bearer-token.guard';
import { User } from '../common/decorator/user/user.decorator';
import { AuthNaverService } from '../auth/auth-naver.service';

@Controller('social-accounts')
export class SocialAccountsController {
  constructor(
    private readonly socialAccountsService: SocialAccountsService,
    private readonly authKakaoService: AuthKakaoService,
    private readonly authNaverService: AuthNaverService,
  ) {}

  // 공통 함수로 카카오 로그인 URL을 생성
  async getKakaoAuthUrl(): Promise<string> {
    return this.authKakaoService.getKakaoLoginUrl();
  }

  @Get('connect/kakao')
  @Redirect()
  async kakaoLogin() {
    const kakaoAuthUrl = await this.getKakaoAuthUrl();
    return { url: kakaoAuthUrl };
  }

  @Get('connect/kakao/callback')
  @UseGuards(AccessTokenGuard)
  async kakaoConnectCallback(
    @Query('code') code: string,
    @User('id') userId: number,
    // @Res() res: Response,
  ) {
    console.log(`userId: ${userId}`);
    const kakaoToken = await this.authKakaoService.getKakaoAccessToken(code); // 카카오 액세스 토큰 발급
    console.log(`kakaoToken: ${kakaoToken}`);
    const userInfo = await this.authKakaoService.getKakaoUserInfo(kakaoToken); // 카카오 사용자 정보 가져오기
    console.log(`userInfo: ${JSON.stringify(userInfo, null, 2)}`);

    try {
      // 카카오 계정 연동
      const createdSocialAccount = await this.authKakaoService.linkKakaoAccount(
        userId,
        userInfo,
      );
      console.log('Successfully linked Kakao account');
      // return res.redirect('/profile'); // 성공 시 프로필 페이지로 리다이렉트
      return createdSocialAccount;
    } catch (error) {
      console.error('Error during Kakao account linking:', error);
      // return res.redirect('/profile'); // 실패 시 다시 연결 페이지로 리다이렉트
    }
  }

  @Get('login/kakao/callback')
  async kakaoCallback(@Query('code') code: string) {
    const kakaoToken = await this.authKakaoService.getKakaoAccessToken(code);
    console.log(`kakaoToken: ${kakaoToken}`);
    const userInfo = await this.authKakaoService.getKakaoUserInfo(kakaoToken);
    console.log(`userInfo: ${JSON.stringify(userInfo, null, 2)}`);

    try {
      return this.authKakaoService.loginWithKakao(userInfo);
    } catch (error) {
      // return res.redirect('/login');
      console.error('Error during Kakao login:', error);
    }
  }

  @Get('connect/naver')
  @Redirect()
  async naverLogin() {
    const naverAuthUrl = await this.authNaverService.getNaverLoginUrl();
    return { url: naverAuthUrl };
  }

  @Get('connect/naver/callback')
  @UseGuards(AccessTokenGuard)
  async naverConnectCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @User('id') userId: number,
    // @Res() res: Response,
  ) {
    console.log(`userId: ${userId}`);
    const naverToken = await this.authNaverService.getNaverAccessToken(
      code,
      state,
    );
    console.log(`naverToken: ${naverToken}`);
    const userInfo = await this.authNaverService.getNaverUserInfo(naverToken);
    console.log(`userInfo: ${JSON.stringify(userInfo, null, 2)}`);

    try {
      const createdSocialAccount = await this.authNaverService.linkNaverAccount(
        userId,
        userInfo,
      );
      console.log('Successfully linked Naver account');
      // return res.redirect('/profile');
      return createdSocialAccount;
    } catch (error) {
      console.error('Error during Naver account linking:', error);
      // return res.redirect('/profile');
    }
  }

  // 네이버 로그인 콜백 처리
  @Get('login/naver/callback')
  async naverCallback(
    @Query('code') code: string,
    @Query('state') state: string,
  ) {
    // 네이버 토큰 요청
    const naverToken = await this.authNaverService.getNaverAccessToken(
      code,
      state,
    );
    console.log(`naverToken: ${naverToken}`);

    // 네이버 사용자 정보 요청
    const userInfo = await this.authNaverService.getNaverUserInfo(naverToken);
    console.log(`userInfo: ${JSON.stringify(userInfo, null, 2)}`);

    // 사용자 정보로 로그인 처리
    return this.authNaverService.loginWithNaver(userInfo);
  }
}
