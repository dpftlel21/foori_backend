import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { MypageService } from './mypage.service';
import { BookingService } from '../booking/booking.service';
import { User } from '../common/decorator/user/user.decorator';
import { AccessTokenGuard } from '../auth/guard/bearer-token.guard';
import { PlaceService } from '../place/place.service';
import { ReviewsService } from '../reviews/reviews.service';

@Controller('mypage')
export class MypageController {
  constructor(
    private readonly mypageService: MypageService,
    private readonly bookingService: BookingService,
    private readonly placeService: PlaceService,
    private readonly reviewService: ReviewsService,
  ) {}

  @Get('my-booking/:bookingId')
  @UseGuards(AccessTokenGuard)
  async getMyBooking(
    @User('email') userEmail: string,
    @Param('bookingId') bookingId: number,
  ) {
    return this.bookingService.findBookingById(userEmail, bookingId);
  }

  @Get('my-bookings')
  @UseGuards(AccessTokenGuard)
  async getMyBookings(@User('email') userEmail: string) {
    return this.bookingService.findBookingByUserEmail(userEmail);
  }

  @Get('my-place')
  @UseGuards(AccessTokenGuard)
  async getMyPlace(@User('email') userEmail: string) {
    return this.placeService.findMyPlaceByUserEmail(userEmail);
  }

  @Get('my-reviews')
  @UseGuards(AccessTokenGuard)
  async getMyReviews(@User('email') userEmail: string) {
    return this.reviewService.findReviewsByUserEmail(userEmail);
  }
}
