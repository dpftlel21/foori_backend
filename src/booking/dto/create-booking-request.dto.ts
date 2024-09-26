import { RestaurantInfoRequestDto } from '../../place/restaurant-info-request.dto';
import { CreateBookingMenusRequestDto } from '../../booking-menus/dto/create-booking-menus-request.dto';

export class CreateBookingRequestDto {
  bookingDate: string;
  bookingTime: string;
  numOfPeople: number;
  restaurant: RestaurantInfoRequestDto;
  bookingMenus: CreateBookingMenusRequestDto[];
}
