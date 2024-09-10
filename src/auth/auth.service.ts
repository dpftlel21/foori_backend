import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { PostUserInfoForSignTokenRequestDto } from './dto/post-user-info-for-sign-token-request.dto';
import {
  ACCESS_EXPIRES_IN,
  JWT_SECRET,
  REFRESH_EXPIRES_IN,
} from './const/auth.const';
import { LoginUserRequestDto } from './dto/login-user-request.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async loginWithEmail(user: LoginUserRequestDto) {
    const findUser = await this.usersService.findUserByEmail(user.email);

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
   * Payload에 들어갈 정보를 받아서 토큰을 발급하는 함수
   * @param user
   * @param isRefreshToken
   */
  signToken(user: PostUserInfoForSignTokenRequestDto, isRefreshToken: boolean) {
    const payload = {
      email: user.email,
      sub: user.id,
      type: isRefreshToken ? 'refresh' : 'access',
    };

    return this.jwtService.sign(payload, {
      secret: JWT_SECRET,
      expiresIn: isRefreshToken ? REFRESH_EXPIRES_IN : ACCESS_EXPIRES_IN,
    });
  }
}
