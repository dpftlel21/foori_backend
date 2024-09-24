import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RestaurantEntity } from '../common/crawl/entities/restaurant.entity';
import { Repository } from 'typeorm';
import { MenuEntity } from '../common/crawl/entities/menu.entity';

@Injectable()
export class PlaceService {
  constructor(
    @InjectRepository(RestaurantEntity)
    private readonly restaurantRepository: Repository<RestaurantEntity>,
    @InjectRepository(MenuEntity)
    private readonly menuRepository: Repository<MenuEntity>,
  ) {}

  async getRestaurant(id: number) {
    return await this.restaurantRepository.find({
      where: { id },
      relations: ['menus'],
    });
  }
}
