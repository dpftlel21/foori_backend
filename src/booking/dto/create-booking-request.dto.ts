import { RestaurantInfoRequestDto } from '../../place/dto/restaurant-info-request.dto';
import { CreateBookingMenusRequestDto } from '../../booking-menus/dto/create-booking-menus-request.dto';
import { IsDate, IsNumber, ValidateNested } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateBookingRequestDto {
  @Transform(({ value }) => new Date(`${value}T00:00:00`))
  @IsDate()
  bookingDate: Date;
  @Transform(({ obj }) => new Date(`${obj.bookingDate}T${obj.bookingTime}`))
  @IsDate()
  bookingTime: Date;
  @IsNumber()
  numOfPeople: number;
  @ValidateNested() // 객체 타입을 기대
  @Type(() => RestaurantInfoRequestDto)
  restaurant: RestaurantInfoRequestDto;
  @ValidateNested({ each: true }) // 배열의 각 항목에 대해 객체 타입을 기대
  @Type(() => CreateBookingMenusRequestDto)
  bookingMenus: CreateBookingMenusRequestDto[];
}
