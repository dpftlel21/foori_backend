import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator';
export class CreateReviewRequestDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  @Max(5)
  @Type(() => Number) // ParseIntPipe 대신 @Type 사용
  rating: number;

  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number) // ParseIntPipe 대신 @Type 사용
  bookingId: number;
}
