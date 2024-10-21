import { IsDate, IsNumber, IsString } from 'class-validator';
import { Expose } from 'class-transformer';

export class ReviewResponseDto {
  @Expose()
  @IsNumber()
  id: number;
  @Expose()
  @IsString()
  content: string;
  @Expose()
  @IsNumber()
  rating: number;
  @Expose()
  @IsDate()
  createdAt: Date;
  @Expose()
  @IsDate()
  updatedAt: Date;
  @Expose()
  @IsNumber()
  userId: number;
  @Expose()
  @IsNumber()
  restaurantId: number;
}
