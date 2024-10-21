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

  /**
   * 리뷰 작성 함수
   * @param userEmail
   * @param createReviewRequestDto
   */
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

      await this.placeService.updateRestaurantReviewStats(findRestaurant.id);
      await this.bookingService.updateBookingReviewedStatus(findBooking.id);

      return savedReview;
    } catch (error) {
      throw new NotFoundException('리뷰 작성에 실패했습니다.', error.message);
    }
  }

  /**
   * 리뷰 작성 가능 여부 확인 함수
   * @param findBooking
   * @private
   */
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

  /**
   * 리뷰 상세조회 함수
   * @param reviewId
   */
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

  /**
   * 해당 유저의 리뷰 리스트 조회 함수
   * @param userEmail
   */
  async findReviewsByUserEmail(userEmail: string) {
    const findUser = await this.usersService.findUserByEmail(userEmail);
    return await this.reviewRepository.find({
      where: { userId: findUser.id },
    });
  }

  /**
   * 해당 유저의 리뷰 수 조회 함수
   * @param userEmail
   */
  async countReviewsByUserEmail(userEmail: string) {
    const findUser = await this.usersService.findUserByEmail(userEmail);
    console.log(`findUser.id: ${findUser.id}`);
    return await this.reviewRepository.count({
      where: { userId: findUser.id },
    });
  }

  /**
   * 해당 식당의 리뷰 수 및 평균평점 조회 함수
   * @param restaurantId
   */
  async operReviewsByRestaurantId(restaurantId: number) {
    const reviewCount = await this.reviewRepository.count({
      where: { restaurantId },
    });

    const averageRatingResult = await this.reviewRepository
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'averageRating')
      .where('review.restaurantId = :restaurantId', { restaurantId })
      .getRawOne();

    const averageRating = averageRatingResult?.averageRating || 0; // 평점이 없으면 0으로 반환

    return {
      reviewCount,
      averageRating,
    };
  }
}
