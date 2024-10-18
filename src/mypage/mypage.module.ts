import { Module } from '@nestjs/common';
import { MypageService } from './mypage.service';
import { MypageController } from './mypage.controller';
import { BookingModule } from '../booking/booking.module';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { PlaceModule } from '../place/place.module';
import { ReviewsModule } from '../reviews/reviews.module';

@Module({
  imports: [BookingModule, AuthModule, UsersModule, PlaceModule, ReviewsModule],
  controllers: [MypageController],
  providers: [MypageService],
  exports: [MypageService],
})
export class MypageModule {}
