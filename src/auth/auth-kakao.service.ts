import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import axios from 'axios';
import { AuthService } from './auth.service';
import { SocialAccountsService } from '../social-accounts/social-accounts.service';

@Injectable()
export class AuthKakaoService {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
    private readonly socialAccountsService: SocialAccountsService,
  ) {}

  /**
   * 카카오 로그인 URL을 가져오는 함수
   */
  async getKakaoLoginUrl() {
    const clientId = this.configService.get<string>('KAKAO_CLIENT_ID');
    const clientSecret = this.configService.get<string>(
      'KAKAO_CLIENT_SECRET_KEY',
    );
    const redirectUri = this.configService.get<string>('KAKAO_REDIRECT_URI');

    return `https://kauth.kakao.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&client_secret=${clientSecret}`;
  }

  /**
   * 카카오에서 받은 code를 이용해 accessToken을 가져오는 함수
   * @param code
   */
  async getKakaoAccessToken(code: string): Promise<string> {
    const tokenUrl = 'https://kauth.kakao.com/oauth/token';
    const clientId = this.configService.get<string>('KAKAO_CLIENT_ID'); // REST API Key
    const clientSecret = this.configService.get<string>(
      'KAKAO_CLIENT_SECRET_KEY',
    );
    const redirectUri = this.configService.get<string>('KAKAO_REDIRECT_URI'); // Redirect URI

    try {
      const response = await axios.post(
        tokenUrl,
        null, // Body 없이 params로 전달
        {
          params: {
            grant_type: 'authorization_code',
            client_id: clientId, // 카카오 콘솔에서 발급받은 REST API Key
            redirect_uri: redirectUri, // 카카오 콘솔에 등록한 Redirect URI
            code: code, // 카카오에서 받은 인가 코드
            client_secret: clientSecret,
          },
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      console.log(`Access Token Response: ${response.data}`);
      return response.data.access_token; // 액세스 토큰 반환
    } catch (error) {
      console.error(
        'Failed to get Kakao access token:',
        error.response?.data || error.message,
      );
      throw new UnauthorizedException('Failed to get Kakao access token');
    }
  }

  /**
   * 카카오에서 받은 accessToken을 이용해 사용자 정보를 가져오는 함수
   * @param accessToken
   */
  async getKakaoUserInfo(accessToken: string) {
    const userInfoUrl = 'https://kapi.kakao.com/v2/user/me';

    const userInfoResponse = await axios.get(userInfoUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    console.log(`userInfoResponse: ${userInfoResponse.data}`);
    return userInfoResponse.data;
  }

  /**
   * 카카오 로그인을 진행하는 함수
   * @param kakaoUserInfo
   */
  async loginWithKakao(kakaoUserInfo: any) {
    const email = kakaoUserInfo.kakao_account.email;
    console.log(`email: ${email}`);

    const findUser = await this.usersService.findUserByEmail(email);

    if (!findUser) {
      // 에러를 던져서 소셜 계정 연동이 필요함을 알림
      throw new UnauthorizedException(
        '소셜 계정이 연동되지 않았습니다. 일반 로그인 후 소셜 계정을 연동해 주세요.',
      );
    }

    return this.authService.loginUser(findUser);
  }

  /**
   * 카카오 계정을 연동하는 함수
   * @param userId
   * @param kakaoUserInfo
   */
  async linkKakaoAccount(userId: number, kakaoUserInfo: any) {
    const socialId = kakaoUserInfo.kakao_account.id;
    console.log(`social ID: ${socialId}`);
    const findUser =
      await this.socialAccountsService.findSocialAccountBySocialIdAndUserIdAndProvicer(
        userId,
        socialId,
        'kakao',
      );

    if (findUser) {
      throw new UnauthorizedException('이미 연동된 소셜 계정 입니다.');
    }

    const savedSocialLinkInfo = this.socialAccountsService.createSocialAccount(
      userId,
      socialId,
      'kakao',
    );

    return savedSocialLinkInfo;
  }
}
