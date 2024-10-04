import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';
import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import axios from 'axios';
import { AuthService } from './auth.service';
import { SocialAccountsService } from '../social-accounts/social-accounts.service';
import { SocialProvider } from '../social-accounts/enum/social-provider';
import { EntityNotFoundError } from 'typeorm';

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
    return userInfoResponse.data;
  }

  /**
   * 카카오 로그인을 진행하는 함수
   * @param kakaoUserInfo
   */
  async loginWithKakao(kakaoUserInfo: any) {
    const socialId = kakaoUserInfo.id;
    console.log(`social ID: ${socialId}`);
    const findUserId =
      await this.socialAccountsService.findUserIdBySocialIdAndProvider(
        socialId,
        SocialProvider.KAKAO,
      );

    const findUserSocialAccount =
      await this.socialAccountsService.verifyExistSocialAccountBySocialIdAndUserIdAndProvicer(
        {
          userId: findUserId,
          socialId,
          provider: SocialProvider.KAKAO,
        },
      );

    if (!findUserSocialAccount) {
      // 에러를 던져서 소셜 계정 연동이 필요함을 알림
      throw new UnauthorizedException(
        '소셜 계정이 연동되지 않았습니다. 일반 로그인 후 소셜 계정을 연동해 주세요.',
      );
    }

    const findUser = await this.usersService.findUserById(
      findUserSocialAccount.userId,
    );

    return this.authService.loginUser(findUser);
  }

  /**
   * 카카오 계정을 연동하는 함수
   * @param userId
   * @param kakaoUserInfo
   */
  async linkKakaoAccount(userId: number, kakaoUserInfo: any) {
    const socialId = kakaoUserInfo.id;
    console.log(`social ID: ${socialId}`);
    const provider = SocialProvider.KAKAO;
    try {
      const findUser =
        await this.socialAccountsService.verifyExistSocialAccountBySocialIdAndUserIdAndProvicer(
          {
            userId,
            socialId,
            provider,
          },
        );

      if (findUser) {
        throw new UnauthorizedException('이미 연동된 소셜 계정 입니다.');
      }
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        console.log('연동되지 않은 카카오 계정입니다. 연동을 진행합니다.');
        const savedSocialLinkInfo =
          this.socialAccountsService.createSocialAccount({
            userId,
            socialId,
            provider,
          });

        return savedSocialLinkInfo;
      } else {
        throw new InternalServerErrorException(
          '소셜 계정 연동 중 오류가 발생했습니다.',
          error.message,
        );
      }
    }
  }
}
