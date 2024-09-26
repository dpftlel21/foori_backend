import { IsNumber, IsString } from 'class-validator';
export class CreateReviewRequestDto {
  @IsString()
  content: string;
  @IsNumber()
  rating: number;
  @IsNumber()
  bookingId: number;
  @IsNumber()
  restaurantId: number; // 직접 restaurantId를 받도록 수정
}
