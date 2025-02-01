import {
  Body,
  Controller,
  Get,
  ParseIntPipe,
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
import { AuthGoogleService } from '../auth/auth-google.service';

@Controller('social-accounts')
export class SocialAccountsController {
  constructor(
    private readonly socialAccountsService: SocialAccountsService,
    private readonly authKakaoService: AuthKakaoService,
    private readonly authNaverService: AuthNaverService,
    private readonly authGoogleService: AuthGoogleService,
  ) {}

  // 공통 함수로 카카오 로그인 URL을 생성
  async getKakaoAuthUrl(): Promise<string> {
    return this.authKakaoService.getKakaoLoginUrl();
  }

  @Get('connect/kakao')
  // @Redirect()
  async kakaoLogin() {
    const kakaoAuthUrl = await this.getKakaoAuthUrl();
    return { url: kakaoAuthUrl };
  }

  @Get('connect/kakao/callback')
  async kakaoConnectCallback(
    @Query('code') code: string,
    @Query('id', ParseIntPipe) userId: number,
    @Res() res: Response,
  ) {
    console.log(`userId: ${userId}`);
    const kakaoToken = await this.authKakaoService.getKakaoAccessToken(code);
    console.log(`kakaoToken: ${kakaoToken}`);
    const userInfo = await this.authKakaoService.getKakaoUserInfo(kakaoToken);
    console.log(`userInfo: ${JSON.stringify(userInfo, null, 2)}`);

    try {
      await this.authKakaoService.linkKakaoAccount(userId, userInfo);
      console.log('Successfully linked Kakao account');
      return res.redirect(302, 'https://www-foori.com/mypage'); // 프론트엔드 마이페이지로 리디렉션
    } catch (error) {
      console.error('Error during Kakao account linking:', error);
      return res.redirect(302, 'https://www-foori.com/mypage'); // 실패 시 다시 연결 페이지로 리디렉션
    }
  }

  @Get('login/kakao/callback')
  async kakaoCallback(@Query('code') code: string, @Res() res: Response) {
    const kakaoToken = await this.authKakaoService.getKakaoAccessToken(code);
    console.log(`kakaoToken: ${kakaoToken}`);
    const userInfo = await this.authKakaoService.getKakaoUserInfo(kakaoToken);
    console.log(`userInfo: ${JSON.stringify(userInfo, null, 2)}`);

    try {
      const { accessToken, refreshToken } =
        await this.authKakaoService.loginWithKakao(userInfo);

      // 토큰을 쿠키에 저장 (보안 고려)
      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: true, // HTTPS 사용 시
        sameSite: 'strict',
      });
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true, // HTTPS 사용 시
        sameSite: 'strict',
      });

      // 로그인 성공 후 프론트엔드 페이지로 리다이렉트
      return res.redirect(302, 'https://www-foori.com/main');
    } catch (error) {
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

  // 구글 로그인 URL로 리다이렉트
  @Get('connect/google')
  @Redirect()
  async googleLogin() {
    const googleAuthUrl = await this.authGoogleService.getGoogleLoginUrl();

    return { url: googleAuthUrl };
  }

  // 구글 계정 연동 콜백 처리
  @Get('connect/google/callback')
  @UseGuards(AccessTokenGuard) // 로그인된 사용자만 계정 연동 가능
  async googleConnectCallback(
    @Query('code') code: string,
    @User('id') userId: number, // 로그인된 사용자의 ID 가져오기
  ) {
    console.log(`userId: ${userId}`);

    // 구글 액세스 토큰 가져오기
    const googleToken = await this.authGoogleService.getGoogleAccessToken(code);
    console.log(`googleToken: ${googleToken}`);

    // 구글 사용자 정보 가져오기
    const userInfo =
      await this.authGoogleService.getGoogleUserInfo(googleToken);
    console.log(`userInfo: ${JSON.stringify(userInfo, null, 2)}`);

    try {
      // 구글 계정 연동
      const createdSocialAccount =
        await this.authGoogleService.linkGoogleAccount(userId, userInfo);
      console.log('Successfully linked Google account');
      return createdSocialAccount;
    } catch (error) {
      console.error('Error during Google account linking:', error);
      throw error; // 에러 발생 시 처리
    }
  }

  // 구글 로그인 콜백 처리
  @Get('login/google/callback')
  async googleCallback(@Query('code') code: string) {
    const googleToken = await this.authGoogleService.getGoogleAccessToken(code);
    console.log(`googleToken: ${googleToken}`);

    // 구글 사용자 정보 요청
    const userInfo =
      await this.authGoogleService.getGoogleUserInfo(googleToken);
    console.log(`userInfo: ${JSON.stringify(userInfo, null, 2)}`);

    // 사용자 정보로 로그인 처리
    try {
      return this.authGoogleService.loginWithGoogle(userInfo);
    } catch (error) {
      console.error('Error during Google login:', error);
    }
  }
}
