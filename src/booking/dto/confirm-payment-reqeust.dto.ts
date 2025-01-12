import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class ConfirmPaymentRequestDto {
  @IsString()
  @IsNotEmpty()
  paymentKey: string;

  @IsNumber()
  @IsNotEmpty()
  orderId: number;

  @IsNumber()
  @IsNotEmpty()
  amount: number;
}
