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
export class AuthGoogleService {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
    private readonly socialAccountService: SocialAccountsService,
  ) {}

  /**
   * 구글 로그인 URL을 가져오는 함수
   */
  async getGoogleLoginUrl() {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const redirectUri = this.configService.get<string>('GOOGLE_REDIRECT_URI');
    const scope = encodeURIComponent(
      'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
    );

    return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`;
  }

  /**
   * 구글에서 받은 code를 이용해 accessToken을 가져오는 함수
   * @param code
   */
  async getGoogleAccessToken(code: string): Promise<string> {
    const tokenUrl = 'https://oauth2.googleapis.com/token';
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get<string>(
      'GOOGLE_CLIENT_SECRET_KEY',
    );
    const redirectUri = this.configService.get<string>('GOOGLE_REDIRECT_URI');

    try {
      const response = await axios.post(tokenUrl, {
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      });

      return response.data.access_token;
    } catch (error) {
      console.error(
        'Failed to get Google access token:',
        error.response?.data || error.message,
      );
      throw new UnauthorizedException('Failed to get Google access token');
    }
  }

  /**
   * 구글 사용자 정보 가져오기
   * @param accessToken
   */
  async getGoogleUserInfo(accessToken: string): Promise<any> {
    const userInfoUrl = 'https://www.googleapis.com/oauth2/v2/userinfo';

    try {
      const response = await axios.get(userInfoUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return response.data;
    } catch (error) {
      console.error(
        'Failed to fetch Google user info:',
        error.response?.data || error.message,
      );
      throw new UnauthorizedException('Failed to fetch Google user info');
    }
  }

  /**
   * 구글 사용자 정보로 로그인 처리
   * @param googleUserInfo
   */
  async loginWithGoogle(googleUserInfo: any) {
    const socialId = googleUserInfo.id;
    console.log(`social ID: ${socialId}`);

    const findUserId =
      await this.socialAccountService.findUserIdBySocialIdAndProvider(
        socialId,
        SocialProvider.GOOGLE,
      );

    const findUserSocialAccount =
      await this.socialAccountService.verifyExistSocialAccountBySocialIdAndUserIdAndProvicer(
        {
          userId: findUserId,
          socialId,
          provider: SocialProvider.GOOGLE,
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

  /**
   * 기존 사용자에 구글 계정 연동
   * @param userId
   * @param googleUserInfo
   */
  async linkGoogleAccount(userId: number, googleUserInfo: any) {
    const socialId = googleUserInfo.id;
    console.log(`social ID: ${socialId}`);
    const provider = SocialProvider.GOOGLE;

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
        console.log('연동되지 않은 구글 계정입니다. 연동을 진행합니다.');
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
          'Failed to link Google account',
          error.message,
        );
      }
    }
  }
}
