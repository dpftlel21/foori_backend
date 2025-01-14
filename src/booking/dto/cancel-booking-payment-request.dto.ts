import { IsString } from 'class-validator';

export class CancelBookingPaymentRequestDto {
  @IsString()
  paymentKey: string;

  @IsString()
  orderId: string;

  @IsString()
  cancelReason: string;
}
