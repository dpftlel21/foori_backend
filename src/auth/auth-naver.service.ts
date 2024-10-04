import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { SocialAccountsService } from '../social-accounts/social-accounts.service';
import axios from 'axios';
import { SocialProvider } from '../social-accounts/enum/social-provider';
import { EntityNotFoundError } from 'typeorm';

@Injectable()
export class AuthNaverService {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
    private readonly socialAccountService: SocialAccountsService,
  ) {}

  /**
   * 네이버 로그인 URL을 가져오는 함수
   */
  async getNaverLoginUrl() {
    const clientId = this.configService.get<string>('NAVER_CLIENT_ID');
    const redirectUri = this.configService.get<string>('NAVER_REDIRECT_URI');

    return `https://nid.naver.com/oauth2.0/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code`;
  }

  /**
   * 네이버에서 받은 code를 이용해 accessToken을 가져오는 함수
   * @param code
   * @param state
   */
  async getNaverAccessToken(code: string, state: string): Promise<string> {
    const tokenUrl = 'https://nid.naver.com/oauth2.0/token';
    const clientId = this.configService.get<string>('NAVER_CLIENT_ID');
    const clientSecret = this.configService.get<string>(
      'NAVER_CLIENT_SECRET_KEY',
    );
    const redirectUri = this.configService.get<string>('NAVER_REDIRECT_URI');

    try {
      const response = await axios.post(tokenUrl, null, {
        params: {
          grant_type: 'authorization_code',
          client_id: clientId,
          client_secret: clientSecret,
          code,
          state,
          redirect_uri: redirectUri,
        },
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      console.log('Naver access token:', response);
      return response.data.access_token;
    } catch (error) {
      console.error(
        'Failed to get Naver access token:',
        error.response?.data || error.message,
      );
      throw new UnauthorizedException('Failed to get Naver access token');
    }
  }

  /**
   * 네이버 사용자 정보 가져오기
   * @param accessToken
   */
  async getNaverUserInfo(accessToken: string): Promise<any> {
    const userInfoUrl = 'https://openapi.naver.com/v1/nid/me';

    try {
      const response = await axios.get(userInfoUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return response.data.response;
    } catch (error) {
      console.error(
        'Failed to fetch Naver user info:',
        error.response?.data || error.message,
      );
      throw new UnauthorizedException('Failed to fetch Naver user info');
    }
  }

  /**
   * 네이버 사용자 정보로 로그인 처리
   * @param naverUserInfo
   */
  async loginWithNaver(naverUserInfo: any) {
    const socialId = naverUserInfo.id;
    console.log(`social ID: ${socialId}`);

    // 이메일로 기존 회원 조회
    const findUserId =
      await this.socialAccountService.findUserIdBySocialIdAndProvider(
        socialId,
        SocialProvider.NAVER,
      );

    const findUserSocialAccount =
      await this.socialAccountService.verifyExistSocialAccountBySocialIdAndUserIdAndProvicer(
        {
          userId: findUserId,
          socialId,
          provider: SocialProvider.NAVER,
        },
      );

    if (!findUserSocialAccount) {
      throw new UnauthorizedException(
        '소셜 계정이 연동되지 않았습니다. 일반 로그인 후 소셜 계정을 연동해 주세요.',
      );
    }

    const findUser = await this.usersService.findUserById(
      findUserSocialAccount.userId,
    );

    return this.authService.loginUser(findUser);
  }

  async linkNaverAccount(userId: number, naverUserInfo: any) {
    const socialId = naverUserInfo.id;
    console.log(`social ID: ${socialId}`);
    const provider = SocialProvider.NAVER;

    try {
      const findUser =
        await this.socialAccountService.verifyExistSocialAccountBySocialIdAndUserIdAndProvicer(
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
        console.log('연동되지 않은 네이버 계정입니다. 연동을 진행합니다.');
        const createSocialAccountLinkRequestDto = {
          userId,
          socialId,
          provider,
        };
        const savedSocialLinkInfo =
          this.socialAccountService.createSocialAccount(
            createSocialAccountLinkRequestDto,
          );
        return savedSocialLinkInfo;
      } else {
        throw new InternalServerErrorException(
          'Failed to link Naver account',
          error.message,
        );
      }
    }
  }
}
