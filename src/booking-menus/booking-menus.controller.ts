import { Controller } from '@nestjs/common';
import { BookingMenusService } from './booking-menus.service';

@Controller('booking-menus')
export class BookingMenusController {
  constructor(private readonly bookingMenusService: BookingMenusService) {}
}
