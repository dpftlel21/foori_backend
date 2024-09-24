import { IsNumber, IsString } from 'class-validator';

export class CreateReviewRequestDto {
  @IsString()
  content: string;
  @IsNumber()
  rating: number;
  @IsNumber()
  restaurantId: number;
}
