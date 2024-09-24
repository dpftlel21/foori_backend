import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ReviewEntity } from './entities/review.entity';
import { Repository } from 'typeorm';
import { CreateReviewRequestDto } from './dto/create-review-request.dto';
import { UsersService } from 'src/users/users.service';
import { PlaceService } from '../place/place.service';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(ReviewEntity)
    private readonly reviewRepository: Repository<ReviewEntity>,
    private readonly usersService: UsersService,
    private readonly placeService: PlaceService,
  ) {}

  async createReview(
    userEmail: string,
    createReviewRequestDto: CreateReviewRequestDto,
  ) {
    const verifyUser = await this.usersService.findUserByEmail(userEmail);
    await this.placeService.findRestaurantById(
      createReviewRequestDto.restaurantId,
    );

    const createdReview = this.reviewRepository.create({
      ...createReviewRequestDto,
      user: verifyUser,
    });

    return await this.reviewRepository.save(createdReview);
  }
}
