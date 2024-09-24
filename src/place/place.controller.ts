import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseInterceptors,
} from '@nestjs/common';
import { PlaceService } from './place.service';

@Controller('place')
@UseInterceptors(ClassSerializerInterceptor)
export class PlaceController {
  constructor(private readonly placeService: PlaceService) {}

  @Get(':id')
  async getRestaurant(@Param('id', ParseIntPipe) id: number) {
    return this.placeService.getRestaurant(id);
  }
}
