import { Module } from '@nestjs/common';
import { PlaceService } from './place.service';
import { PlaceController } from './place.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestaurantEntity } from './entities/restaurant.entity';
import { MenuEntity } from '../menus/entities/menu.entity';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RestaurantEntity, MenuEntity]),
    AuthModule,
    UsersModule,
  ],
  controllers: [PlaceController],
  providers: [PlaceService],
  exports: [PlaceService],
})
export class PlaceModule {}
