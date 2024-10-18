import { Injectable, NotFoundException } from '@nestjs/common';
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
      userId: verifyUser.id,
    });

    return await this.reviewRepository.save(createdReview);
  }

  async findReviewById(reviewId: number) {
    try {
      const findReview = await this.reviewRepository.findOneOrFail({
        where: { id: reviewId },
      });

      return findReview;
    } catch (error) {
      throw new NotFoundException('일치하는 리뷰 정보가 없습니다.');
    }
  }

  async findReviewsByUserEmail(userEmail: string) {
    const findUser = await this.usersService.findUserByEmail(userEmail);
    return await this.reviewRepository.find({
      where: { userId: findUser.id },
    });
  }
}
