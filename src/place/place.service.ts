import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RestaurantEntity } from './entities/restaurant.entity';
import { Repository } from 'typeorm';
import { MenuEntity } from '../menus/entities/menu.entity';

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

  async findRestaurantById(id: number) {
    try {
      const findRestaurant = await this.restaurantRepository.findOneOrFail({
        where: { id },
        relations: ['menus'],
      });

      return findRestaurant;
    } catch (error) {
      throw new NotFoundException('일치하는 식당 정보가 없습니다.');
    }
  }
}
