import {
  Body,
  Controller,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { AccessTokenGuard } from '../auth/guard/bearer-token.guard';
import { User } from '../common/decorator/user/user.decorator';
import { CreateReviewRequestDto } from './dto/create-review-request.dto';
import { OptionalFileInterceptor } from '../common/decorator/upload/optional-file-interceptor.decorator';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(AccessTokenGuard)
  @UseInterceptors(
    OptionalFileInterceptor('files', {
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    }),
  )
  async createReview(
    @User('email') userEmail: string,
    @Body() createDto: CreateReviewRequestDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    return this.reviewsService.createReview(userEmail, createDto, files);
  }
}
