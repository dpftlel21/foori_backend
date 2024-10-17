import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RestaurantEntity } from './entities/restaurant.entity';
import { Repository } from 'typeorm';
import { MenuEntity } from '../menus/entities/menu.entity';
import { plainToInstance } from 'class-transformer';
import { RestaurantInfoResponseDto } from './dto/restaurant-info-response.dto';

@Injectable()
export class PlaceService {
  constructor(
    @InjectRepository(RestaurantEntity)
    private readonly restaurantRepository: Repository<RestaurantEntity>,
    @InjectRepository(MenuEntity)
    private readonly menuRepository: Repository<MenuEntity>,
  ) {}

  async findRestaurantById(id: number): Promise<RestaurantInfoResponseDto> {
    try {
      const findRestaurant = await this.restaurantRepository.findOneOrFail({
        where: { id },
        relations: ['menus'],
      });

      return plainToInstance(RestaurantInfoResponseDto, findRestaurant, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      throw new NotFoundException('일치하는 식당 정보가 없습니다.');
    }
  }
}
