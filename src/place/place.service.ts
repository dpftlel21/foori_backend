import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RestaurantEntity } from './entities/restaurant.entity';
import { Repository } from 'typeorm';
import { MenuEntity } from '../menus/entities/menu.entity';
import { plainToInstance } from 'class-transformer';
import { RestaurantInfoResponseDto } from './dto/restaurant-info-response.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class PlaceService {
  constructor(
    @InjectRepository(RestaurantEntity)
    private readonly restaurantRepository: Repository<RestaurantEntity>,
    @InjectRepository(MenuEntity)
    private readonly menuRepository: Repository<MenuEntity>,
    private readonly userService: UsersService,
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

  async findMyPlaceByUserEmail(userEmail: string) {
    const findUser = await this.userService.findUserByEmail(userEmail);

    return await this.restaurantRepository
      .createQueryBuilder('restaurant')
      .leftJoin('restaurant.favorites', 'favorite')
      .select([
        'restaurant.name',
        'restaurant.address',
        'restaurant.locationNum',
        'restaurant.postalCode',
        'restaurant.telNum',
      ])
      .where('favorite.userId = :userId', { userId: findUser.id })
      .getMany();
  }
}
