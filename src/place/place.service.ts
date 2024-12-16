import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RestaurantEntity } from './entities/restaurant.entity';
import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { RestaurantInfoResponseDto } from './dto/restaurant-info-response.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class PlaceService {
  constructor(
    @InjectRepository(RestaurantEntity)
    private readonly restaurantRepository: Repository<RestaurantEntity>,
    private readonly userService: UsersService,
  ) {}

  async findRestaurantById(id: number): Promise<RestaurantInfoResponseDto> {
    try {
      const findRestaurant = await this.restaurantRepository.findOneOrFail({
        where: { id },
        relations: ['menus', 'reviews'],
      });

      return plainToInstance(RestaurantInfoResponseDto, findRestaurant, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      throw new NotFoundException('일치하는 식당 정보가 없습니다.');
    }
  }

  async findAllRestaurants(): Promise<RestaurantInfoResponseDto[]> {
    try {
      const findAll = await this.restaurantRepository.find();

      return findAll.map((restaurant) =>
        plainToInstance(RestaurantInfoResponseDto, restaurant, {
          excludeExtraneousValues: true,
        }),
      );
    } catch (error) {
      throw new NotFoundException('식당 정보가 없습니다.');
    }
  }

  async findMyPlaceByUserEmail(userEmail: string) {
    const findUser = await this.userService.findUserByEmail(userEmail);

    return await this.restaurantRepository
      .createQueryBuilder('restaurant')
      .leftJoin('restaurant.favorites', 'favorite')
      .select([
        'restaurant.id',
        'restaurant.name',
        'restaurant.address',
        'restaurant.locationNum',
        'restaurant.postalCode',
        'restaurant.telNum',
      ])
      .where('favorite.userId = :userId', { userId: findUser.id })
      .getMany();
  }

  async updateRestaurantReviewStats(restaurantId: number) {
    // 식당 조회 및 관련 리뷰 가져오기
    const restaurant = await this.restaurantRepository.findOne({
      where: { id: restaurantId },
      relations: ['reviews'],
    });

    if (!restaurant) {
      throw new NotFoundException('해당 식당을 찾을 수 없습니다.');
    }

    // 리뷰 수 계산
    const reviewCount = restaurant.reviews.length;

    // 평균 평점 계산
    const ratingAvg =
      reviewCount > 0
        ? restaurant.reviews.reduce((sum, review) => sum + review.rating, 0) /
          reviewCount
        : 0;

    // 리뷰 수와 평균 평점 업데이트
    Object.assign(restaurant, { reviewCount, ratingAvg });

    // 업데이트된 식당 정보 저장
    await this.restaurantRepository.save(restaurant);
  }
}
