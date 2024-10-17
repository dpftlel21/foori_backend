import { Module } from '@nestjs/common';
import { MypageService } from './mypage.service';
import { MypageController } from './mypage.controller';
import { BookingModule } from '../booking/booking.module';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [BookingModule, AuthModule, UsersModule],
  controllers: [MypageController],
  providers: [MypageService],
  exports: [MypageService],
})
export class MypageModule {}
