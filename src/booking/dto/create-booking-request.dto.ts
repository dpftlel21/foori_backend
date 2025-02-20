import { RestaurantInfoRequestDto } from '../../place/dto/restaurant-info-request.dto';
import { CreateBookingMenusRequestDto } from '../../booking-menus/dto/create-booking-menus-request.dto';
import { IsNumber, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBookingRequestDto {
  // @Transform(({ value }) => new Date(value))
  @IsString() //문자열로 받음.
  bookingDateTime: string;
  @IsNumber()
  numOfPeople: number;
  @ValidateNested() // 객체 타입을 기대
  @Type(() => RestaurantInfoRequestDto)
  restaurant: RestaurantInfoRequestDto;
  @ValidateNested({ each: true }) // 배열의 각 항목에 대해 객체 타입을 기대
  @Type(() => CreateBookingMenusRequestDto)
  bookingMenus: CreateBookingMenusRequestDto[];
}
