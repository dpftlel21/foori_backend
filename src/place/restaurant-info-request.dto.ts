import { IsNumber } from 'class-validator';

export class RestaurantInfoRequestDto {
  @IsNumber()
  restaurantId: number;
}
