import { Module } from '@nestjs/common';
import { BookingMenusService } from './booking-menus.service';
import { BookingMenusController } from './booking-menus.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingMenuEntity } from './entities/booking-menus.entity';
import { BookingEntity } from 'src/booking/entities/booking.entity';
import { MenuEntity } from 'src/menus/entities/menu.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([BookingEntity, MenuEntity, BookingMenuEntity]),
  ],
  controllers: [BookingMenusController],
  providers: [BookingMenusService],
  exports: [BookingMenusService],
})
export class BookingMenusModule {}
