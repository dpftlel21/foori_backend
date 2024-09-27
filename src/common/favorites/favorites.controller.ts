import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { User } from '../decorator/user/user.decorator';
import { AccessTokenGuard } from '../../auth/guard/bearer-token.guard';

@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post('toggle/:placeId')
  @UseGuards(AccessTokenGuard)
  async toggleFavorite(
    @User('email') userEmail: string,
    @Param('restaurantId', ParseIntPipe) placeId: number,
  ) {
    return this.favoritesService.toggleFavorite(userEmail, placeId);
  }

  @Get(':placeId')
  @UseGuards(AccessTokenGuard)
  async isFavorite(
    @User('email') userEmail: string,
    @Param('restaurantId', ParseIntPipe) placeId: number,
  ) {
    return this.favoritesService.isFavorite(userEmail, placeId);
  }
}
