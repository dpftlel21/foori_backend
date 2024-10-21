import { IsNumber, IsString, Max, Min } from 'class-validator';
export class CreateReviewRequestDto {
  @IsString()
  content: string;
  @IsNumber()
  @Min(0)
  @Max(5)
  rating: number;
  @IsNumber()
  bookingId: number;
}
