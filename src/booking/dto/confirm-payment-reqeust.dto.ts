import { IsNumber, IsString } from 'class-validator';

export class ConfirmPaymentRequestDto {
  @IsString()
  paymentKey: string;

  @IsString()
  orderId: string;

  @IsNumber()
  amount: number;
}
