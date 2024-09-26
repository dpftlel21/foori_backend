import { Module } from '@nestjs/common';
import { CrawlService } from './crawl.service';
import { CrawlController } from './crawl.controller';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuEntity } from '../../menus/entities/menu.entity';
import { RestaurantEntity } from '../../place/entities/restaurant.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([MenuEntity, RestaurantEntity]),
    HttpModule,
  ],
  controllers: [CrawlController],
  providers: [CrawlService],
})
export class CrawlModule {}
