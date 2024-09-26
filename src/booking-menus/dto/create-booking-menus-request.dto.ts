import { IsNumber } from 'class-validator';

export class CreateBookingMenusRequestDto {
  @IsNumber()
  menuId: number;
  @IsNumber()
  quantity: number;
}
