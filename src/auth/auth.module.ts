import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { AuthKakaoService } from './auth-kakao.service';
import { SocialAccountsModule } from '../social-accounts/social-accounts.module';
import { AuthNaverService } from './auth-naver.service';

@Module({
  imports: [
    JwtModule.register({}),
    UsersModule,
    forwardRef(() => SocialAccountsModule),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthKakaoService, AuthNaverService],
  exports: [AuthService, AuthKakaoService, AuthNaverService],
})
export class AuthModule {}
