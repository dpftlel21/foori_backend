import {
  Body,
  Controller,
  Post,
  UploadedFiles,
  UseGuards,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { AccessTokenGuard } from '../auth/guard/bearer-token.guard';
import { User } from '../common/decorator/user/user.decorator';
import { CreateReviewRequestDto } from './dto/create-review-request.dto';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(AccessTokenGuard)
  async createReview(
    @User('email') userEmail: string,
    @Body() createDto: CreateReviewRequestDto,
    @UploadedFiles() files?: Express.Multer.File[] | undefined,
  ) {
    return this.reviewsService.createReview(userEmail, createDto, files);
  }
}
