import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { MypageService } from './mypage.service';
import { BookingService } from '../booking/booking.service';
import { User } from '../common/decorator/user/user.decorator';
import { AccessTokenGuard } from '../auth/guard/bearer-token.guard';
import { PlaceService } from '../place/place.service';
import { ReviewsService } from '../reviews/reviews.service';
import { UsersService } from '../users/users.service';

@Controller('mypage')
export class MypageController {
  constructor(
    private readonly mypageService: MypageService,
    private readonly bookingService: BookingService,
    private readonly placeService: PlaceService,
    private readonly reviewService: ReviewsService,
    private readonly userService: UsersService,
  ) {}

  @Get('my-stats/:year/:month')
  @UseGuards(AccessTokenGuard)
  async getMyMonthlyStats(
    @User('email') userEmail: string,
    @Param('year') year: number,
    @Param('month') month: number,
  ) {
    return this.bookingService.getMyMonthlyStats(userEmail, year, month);
  }

  @Get('my-booking/:bookingId')
  @UseGuards(AccessTokenGuard)
  async getMyBooking(
    @User('email') userEmail: string,
    @Param('bookingId') bookingId: number,
  ) {
    return this.bookingService.findBookingById(userEmail, bookingId);
  }

  @Get('my-booking')
  @UseGuards(AccessTokenGuard)
  async getMyBookings(@User('email') userEmail: string) {
    return this.bookingService.findBookingByUserEmail(userEmail);
  }

  @Get('my-place')
  @UseGuards(AccessTokenGuard)
  async getMyPlace(@User('email') userEmail: string) {
    return this.placeService.findMyPlaceByUserEmail(userEmail);
  }

  @Get('my-review')
  @UseGuards(AccessTokenGuard)
  async getMyReviews(@User('email') userEmail: string) {
    return this.reviewService.findReviewsByUserEmail(userEmail);
  }

  @Get('my-review/:reviewId')
  @UseGuards(AccessTokenGuard)
  async getMyReview(
    @User('email') userEmail: string,
    @Param('reviewId') reviewId: number,
  ) {
    this.userService.findUserByEmail(userEmail);
    return this.reviewService.findReviewById(reviewId);
  }

  @Get('my-review-count')
  @UseGuards(AccessTokenGuard)
  async getMyReviewOper(@User('email') userEmail: string) {
    return this.reviewService.operReviewsByUserEmail(userEmail);
  }
}
