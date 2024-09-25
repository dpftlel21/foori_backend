import { Module } from '@nestjs/common';
import { BookingMenusService } from './booking-menus.service';
import { BookingMenusController } from './booking-menus.controller';

@Module({
  controllers: [BookingMenusController],
  providers: [BookingMenusService],
})
export class BookingMenusModule {}
