import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FavoritesEntity } from '../entities/favorites.entity';
import { Repository } from 'typeorm';
import { UsersService } from '../../users/users.service';
import { PlaceService } from '../../place/place.service';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(FavoritesEntity)
    private readonly favoritesRepository: Repository<FavoritesEntity>,
    private readonly userService: UsersService,
    private readonly placeService: PlaceService,
  ) {}

  async addFavorite(userEmail: string, placeId: number) {
    const findUser = await this.userService.findUserByEmail(userEmail);
    const findPlace = await this.placeService.findRestaurantById(placeId);
    const favorite = this.favoritesRepository.create({
      userId: findUser.id,
      restaurantId: findPlace.id,
    });
    return await this.favoritesRepository.save(favorite);
  }

  async removeFavorite(userEmail: string, placeId: number) {
    const findUser = await this.userService.findUserByEmail(userEmail);
    const findPlace = await this.placeService.findRestaurantById(placeId);
    const favorite = await this.favoritesRepository.findOne({
      where: { userId: findUser.id, restaurantId: findPlace.id },
    });
    return await this.favoritesRepository.remove(favorite);
  }

  async isFavorite(userEmail: string, placeId: number) {
    const findUser = await this.userService.findUserByEmail(userEmail);
    const findPlace = await this.placeService.findRestaurantById(placeId);
    const favorite = await this.favoritesRepository.findOne({
      where: { userId: findUser.id, restaurantId: findPlace.id },
    });
    return favorite ? 1 : 0; // 'favorite' 객체가 존재하면 1, 존재하지 않으면 0
  }

  async toggleFavorite(userEmail: string, placeId: number): Promise<number> {
    const findUser = await this.userService.findUserByEmail(userEmail);
    const findPlace = await this.placeService.findRestaurantById(placeId);

    const existingFavorite = await this.favoritesRepository.findOne({
      where: { userId: findUser.id, restaurantId: findPlace.id },
    });

    if (existingFavorite) {
      // 이미 좋아요가 존재하면 삭제
      await this.favoritesRepository.remove(existingFavorite);
      return 0; // 좋아요 취소 후 0 반환
    } else {
      // 좋아요가 없다면 새로 추가
      const newFavorite = this.favoritesRepository.create({
        userId: findUser.id,
        restaurantId: findPlace.id,
      });
      await this.favoritesRepository.save(newFavorite);
      return 1; // 좋아요 추가 후 1 반환
    }
  }
}
