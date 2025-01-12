import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { BookingService } from './booking.service';
import { AccessTokenGuard } from '../auth/guard/bearer-token.guard';
import { User } from '../common/decorator/user/user.decorator';
import { CreateBookingRequestDto } from './dto/create-booking-request.dto';
import { ConfirmPaymentRequestDto } from './dto/confirm-payment-reqeust.dto';

@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  @UseGuards(AccessTokenGuard)
  async createBooking(
    @User('email') userEmail: string,
    @Body() createBookingRequestDto: CreateBookingRequestDto,
  ) {
    return this.bookingService.createBooking(
      userEmail,
      createBookingRequestDto,
    );
  }

  @Post('confirm')
  @UseGuards(AccessTokenGuard)
  async payForBooking(
    @User('email') userEmail: string,
    @Body('confirmPaymentRequestDto')
    confirmPaymentRequestDto: ConfirmPaymentRequestDto,
  ) {
    return this.bookingService.confirmPayment(
      userEmail,
      confirmPaymentRequestDto,
    );
  }

  @Post('cancel')
  @UseGuards(AccessTokenGuard)
  async cancelBooking(
    @User('email') userEmail: string,
    @Body('bookingId') bookingId: number,
  ) {
    return this.bookingService.cancelBooking(userEmail, bookingId);
  }
}
