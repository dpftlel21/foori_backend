import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LikeEntity } from '../entities/like.entity';
import { Repository } from 'typeorm';
import { UsersService } from '../../users/users.service';
import { ReviewsService } from '../../reviews/reviews.service';

@Injectable()
export class LikesService {
  constructor(
    @InjectRepository(LikeEntity)
    private readonly likeRepository: Repository<LikeEntity>,
    private readonly userService: UsersService,
    private readonly reviewService: ReviewsService,
  ) {}

  async addLike(userEmail: string, reviewId: number) {
    const findUser = await this.userService.findUserByEmail(userEmail);
    const findReview = await this.reviewService.findReviewById(reviewId);
    const like = this.likeRepository.create({
      userId: findUser.id,
      reviewId: findReview.id,
    });
    return await this.likeRepository.save(like);
  }

  async removeLike(userEmail: string, reviewId: number) {
    const findUser = await this.userService.findUserByEmail(userEmail);
    const findReview = await this.reviewService.findReviewById(reviewId);
    const like = await this.likeRepository.findOne({
      where: { userId: findUser.id, reviewId: findReview.id },
    });
    return await this.likeRepository.remove(like);
  }

  async isLiked(userEmail: string, reviewId: number) {
    const findUser = await this.userService.findUserByEmail(userEmail);
    const findReview = await this.reviewService.findReviewById(reviewId);
    const like = await this.likeRepository.findOne({
      where: { userId: findUser.id, reviewId: findReview.id },
    });
    return like ? 1 : 0; // 'like' 객체가 존재하면 1, 존재하지 않으면 0
  }

  async toggleLike(userEmail: string, reviewId: number): Promise<number> {
    const findUser = await this.userService.findUserByEmail(userEmail);
    const findReview = await this.reviewService.findReviewById(reviewId);

    const existingLike = await this.likeRepository.findOne({
      where: { userId: findUser.id, reviewId: findReview.id },
    });

    if (existingLike) {
      // 이미 좋아요가 존재하면 삭제
      await this.likeRepository.remove(existingLike);
      return 0; // 좋아요 취소 후 0 반환
    } else {
      // 좋아요가 없다면 새로 추가
      const newLike = this.likeRepository.create({
        userId: findUser.id,
        reviewId: findReview.id,
      });
      await this.likeRepository.save(newLike);
      return 1; // 좋아요 추가 후 1 반환
    }
  }
}
