import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { PostUserInfoForSignTokenRequestDto } from './dto/post-user-info-for-sign-token-request.dto';
import { LoginUserRequestDto } from './dto/login-user-request.dto';
import { RegisterUserRequestDto } from '../users/dto/register-user-request.dto';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * 회원가입을 진행하는 함수
   * - 비밀번호를 해싱해서 저장
   * - 회원가입이 완료되면 로그인을 진행해서 accessToken과 refreshToken을 반환하여
   *   회원가입 후 로그인된 상태로 만들어준다.
   * @param user
   */
  async register(user: RegisterUserRequestDto) {
    const hashRound = parseInt(
      this.configService.get<string>('HASH_ROUND'),
      10,
    ); // HASH_ROUND 가져오기
    const hashPassword = await bcrypt.hash(user.password, hashRound);

    const createdUser = await this.usersService.createUser({
      ...user,
      password: hashPassword,
    });

    return this.loginUser(createdUser);
  }

  /**
   * 사용자가 로그인을 진행하면 accessToken과 refreshToken을 반환하는 함수
   * @param user
   */
  async loginWithEmail(user: LoginUserRequestDto) {
    const findUser = await this.authenticateWithEmailAndPassword(user);

    return this.loginUser(findUser);
  }

  /**
   * 사용자가 로그인을 진행하면 accessToken과 refreshToken을 반환하는 함수
   * @param user
   */
  async loginUser(user: PostUserInfoForSignTokenRequestDto) {
    return {
      accessToken: this.signToken(user, false),
      refreshToken: this.signToken(user, true),
    };
  }

  /**
   * payload에 들어갈 정보를 받아서 토큰을 발급하는 함수
   * @param user
   * @param isRefreshToken
   */
  signToken(user: PostUserInfoForSignTokenRequestDto, isRefreshToken: boolean) {
    try {
      const payload = {
        email: user.email,
        sub: user.id,
        type: isRefreshToken ? 'refresh' : 'access',
      };

      const secret = this.configService.get<string>('JWT_SECRET_KEY'); // JWT_SECRET 가져오기
      const expiresIn = isRefreshToken
        ? this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') // Refresh 토큰 만료 시간
        : this.configService.get<string>('JWT_ACCESS_EXPIRES_IN'); // Access 토큰 만료 시간

      return this.jwtService.sign(payload, { secret, expiresIn });
    } catch (error) {
      throw new UnauthorizedException('토큰 발급에 실패했습니다.');
    }
  }

  /**
   * 헤더에서 토큰을 추출하는 함수
   * @param token
   * @param isBearer
   */
  extractTokenFromHeader(token: string, isBearer: boolean) {
    console.log(`token: ${token}`);
    const splitToken = token.split(' ');
    const prefix = isBearer ? 'Bearer' : 'Basic';

    if (splitToken.length !== 2 || splitToken[0] !== prefix) {
      throw new UnauthorizedException('토큰 형식이 올바르지 않습니다.');
    }

    return splitToken[1];
  }

  /**
   * Basic 토큰을 디코딩하는 방법
   * @param token
   */
  /*decodeBasicToken(base64Token: string) {
    const decodeToken = Buffer.from(base64Token, 'base64').toString('utf8');
    console.log(`decodeToken: ${decodeToken}`);

    const splitToken = decodeToken.split(':');

    if (splitToken.length !== 2) {
      throw new UnauthorizedException('토큰 형식이 올바르지 않습니다.');
    }

    return {
      email: splitToken[0],
      password: splitToken[1],
    };
  }
*/
  /**
   * 토큰을 검증하는 함수
   * @param token
   */
  verifyToken(token: string) {
    try {
      return this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET_KEY'),
      });
    } catch (error) {
      throw new UnauthorizedException('토큰이 만료되었습니다.');
    }
  }

  /**
   * 토큰을 재발급하는 함수
   * @param token
   * @param isRefreshToken
   */
  rotateToken(token: string, isRefreshToken: boolean) {
    const decoded = this.verifyToken(token);

    if (decoded.type !== 'refresh') {
      throw new UnauthorizedException('Refresh 토큰이 아닙니다.');
    }

    return this.signToken(
      {
        ...decoded,
      },
      isRefreshToken,
    );
  }

  /**
   * 사용자가 이메일과 비밀번호로 로그인을 진행하는 함수
   * - 사용자가 존재하는지 확인
   * - 비밀번호가 일치하는지 확인
   * @param user
   */
  async authenticateWithEmailAndPassword(user: LoginUserRequestDto) {
    /**
     * 1. 사용자가 존재하는지 확인 (email)
     * 2. 비밀번호가 일치하는지 확인
     * 3. 모두 통과되면 찾은 사용자 정보 반환
     */
    const findUser = await this.usersService.findUserByEmail(user.email);

    const passwdOk = bcrypt.compare(user.password, findUser.password);

    if (!passwdOk) {
      throw new UnauthorizedException('비밀번호가 일치하지 않습니다.');
    }

    return findUser;
  }

  // async getNaverLoginUrl() {
  //   const clientId = this.configService.get<string>('NAVER_CLIENT_ID');
  //   const redirectUri = this.configService.get<string>('NAVER_REDIRECT_URI');
  //
  //   return `https://nid.naver.com/oauth2.0/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code`;
  // }
  //
  // async getNaverAccessToken(code: string, state: string): Promise<string> {
  //   const tokenUrl = 'https://nid.naver.com/oauth2.0/token';
  //   const clientId = this.configService.get<string>('NAVER_CLIENT_ID');
  //   const clientSecret = this.configService.get<string>('NAVER_CLIENT_SECRET');
  //   const redirectUri = this.configService.get<string>('NAVER_REDIRECT_URI');
  //
  //   try {
  //     const response = await axios.post(tokenUrl, null, {
  //       params: {
  //         grant_type: 'authorization_code',
  //         client_id: clientId,
  //         client_secret: clientSecret,
  //         code,
  //         state,
  //         redirect_uri: redirectUri,
  //       },
  //       headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  //     });
  //
  //     return response.data.access_token;
  //   } catch (error) {
  //     console.error(
  //       'Failed to get Naver access token:',
  //       error.response?.data || error.message,
  //     );
  //     throw new UnauthorizedException('Failed to get Naver access token');
  //   }
  // }
  //
  // // 네이버 사용자 정보 요청
  // async getNaverUserInfo(accessToken: string): Promise<any> {
  //   const userInfoUrl = 'https://openapi.naver.com/v1/nid/me';
  //
  //   try {
  //     const response = await axios.get(userInfoUrl, {
  //       headers: {
  //         Authorization: `Bearer ${accessToken}`,
  //       },
  //     });
  //
  //     return response.data.response;
  //   } catch (error) {
  //     console.error(
  //       'Failed to fetch Naver user info:',
  //       error.response?.data || error.message,
  //     );
  //     throw new UnauthorizedException('Failed to fetch Naver user info');
  //   }
  // }
  //
  // // 네이버 로그인 처리 (통합 로그인)
  // async loginWithNaver(naverUserInfo: any) {
  //   const email = naverUserInfo.email;
  //   const naverUserId = naverUserInfo.id;
  //
  //   // 이메일로 기존 회원 조회
  //   const findUser = await this.usersService.findUserByEmail(email);
  //
  //   if (findUser) {
  //     // 네이버 사용자 ID가 없는 경우 추가
  //     if (!findUser.naverUserId) {
  //       await this.usersService.updateUserNaverId(findUser.id, naverUserId);
  //     }
  //     return this.loginUser(findUser);
  //   } else {
  //     // 새 사용자 생성
  //     const createUser = await this.usersService.createUser({
  //       email,
  //       password: '', // 소셜 로그인에서는 비밀번호 없음
  //       name: naverUserInfo.name,
  //       birth: naverUserInfo.birthyear, // 네이버 API에서 제공
  //       phoneNumber: naverUserInfo.mobile, // 네이버 API에서 제공
  //       // naverUserId,
  //     });
  //
  //     return this.loginUser(createUser);
  //   }
  // }
  //
  // // 로그인 처리 후 토큰 반환 등 추가 로직
  // private loginUser(user: any) {
  //   // 로그인 성공 후의 처리 로직 (JWT 발급 등)
  //   return { message: '로그인 성공', user };
  // }
}
