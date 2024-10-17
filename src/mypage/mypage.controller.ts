import { Controller, Get, UseGuards } from '@nestjs/common';
import { MypageService } from './mypage.service';
import { BookingService } from '../booking/booking.service';
import { User } from '../common/decorator/user/user.decorator';
import { AccessTokenGuard } from '../auth/guard/bearer-token.guard';

@Controller('mypage')
export class MypageController {
  constructor(
    private readonly mypageService: MypageService,
    private readonly bookingService: BookingService,
  ) {}

  @Get('my-booking')
  @UseGuards(AccessTokenGuard)
  async getMyBooking(@User('email') userEmail: string) {
    return this.bookingService.findBookingByUserEmail(userEmail);
  }
}
