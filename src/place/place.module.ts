import { Module } from '@nestjs/common';
import { PlaceService } from './place.service';
import { PlaceController } from './place.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestaurantEntity } from '../common/crawl/entities/restaurant.entity';
import { MenuEntity } from '../common/crawl/entities/menu.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RestaurantEntity, MenuEntity])],
  controllers: [PlaceController],
  providers: [PlaceService],
  exports: [PlaceService],
})
export class PlaceModule {}
