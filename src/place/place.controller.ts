import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseInterceptors,
} from '@nestjs/common';
import { PlaceService } from './place.service';
import { RestaurantInfoResponseDto } from './dto/restaurant-info-response.dto';
import { ReviewsService } from '../reviews/reviews.service';

@Controller('place')
@UseInterceptors(ClassSerializerInterceptor)
export class PlaceController {
  constructor(
    private readonly placeService: PlaceService,
    private readonly reviewService: ReviewsService,
  ) {}

  @Get()
  async getAllRestaurants(): Promise<RestaurantInfoResponseDto[]> {
    return this.placeService.findAllRestaurants();
  }

  @Get(':restaurantId')
  async getRestaurant(
    @Param('restaurantId', ParseIntPipe) id: number,
  ): Promise<RestaurantInfoResponseDto> {
    return this.placeService.findRestaurantById(id);
  }

  @Get(':restaurantId/reviews-count')
  async getRestaurantReviews(@Param('restaurantId', ParseIntPipe) id: number) {
    return this.reviewService.operReviewsByRestaurantId(id);
  }
}
