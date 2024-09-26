import { Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { BookingMenusService } from '../booking-menus/booking-menus.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingEntity } from './entities/booking.entity';
import { BookingMenuEntity } from '../booking-menus/entities/booking-menus.entity';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { PlaceModule } from '../place/place.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([BookingEntity, BookingMenuEntity]),
    AuthModule,
    UsersModule,
    PlaceModule,
  ],
  controllers: [BookingController],
  providers: [BookingService, BookingMenusService],
  exports: [BookingService],
})
export class BookingModule {}
