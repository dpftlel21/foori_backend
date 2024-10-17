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

@Controller('place')
@UseInterceptors(ClassSerializerInterceptor)
export class PlaceController {
  constructor(private readonly placeService: PlaceService) {}

  @Get(':id')
  async getRestaurant(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<RestaurantInfoResponseDto> {
    return this.placeService.findRestaurantById(id);
  }
}
