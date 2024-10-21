import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ReviewEntity } from './entities/review.entity';
import { Repository } from 'typeorm';
import { CreateReviewRequestDto } from './dto/create-review-request.dto';
import { UsersService } from 'src/users/users.service';
import { PlaceService } from '../place/place.service';
import { BookingService } from '../booking/booking.service';
import { BookingEntity } from '../booking/entities/booking.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(ReviewEntity)
    private readonly reviewRepository: Repository<ReviewEntity>,
    private readonly usersService: UsersService,
    private readonly placeService: PlaceService,
    private readonly bookingService: BookingService,
  ) {}

  async createReview(
    userEmail: string,
    createReviewRequestDto: CreateReviewRequestDto,
  ) {
    try {
      const verifyUser = await this.usersService.findUserByEmail(userEmail);

      const findBooking = await this.bookingService.findBookingById(
        userEmail,
        createReviewRequestDto.bookingId,
      );

      this.verifyPossiblePostReview(findBooking);

      const findRestaurant = await this.placeService.findRestaurantById(
        findBooking.restaurant.id,
      );
      console.log(`findRestaurant:id: ${findRestaurant.id}`);

      const createdReview = this.reviewRepository.create({
        ...createReviewRequestDto,
        restaurantId: findRestaurant.id,
        userId: verifyUser.id,
      });

      const savedReview = await this.reviewRepository.save(createdReview);

      await this.bookingService.updateBookingReviewedStatus(findBooking.id);

      return savedReview;
    } catch (error) {
      throw new NotFoundException('리뷰 작성에 실패했습니다.', error.message);
    }
  }

  private verifyPossiblePostReview(findBooking: BookingEntity) {
    if (
      findBooking.bookingTime > new Date() ||
      findBooking.paymentStatus !== 2 ||
      findBooking.status !== 3
    ) {
      throw new NotFoundException(
        '해당 예약에 대한 리뷰를 작성할 수 없습니다.',
      );
    }
    if (findBooking.isReviewed) {
      throw new NotFoundException('이미 리뷰를 작성한 예약입니다.');
    }
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
