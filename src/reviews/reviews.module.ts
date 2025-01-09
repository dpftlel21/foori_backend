import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { BookingModule } from '../booking/booking.module';
import { ImagesModule } from '../common/images/images.module';
import { PlaceModule } from '../place/place.module';
import { UsersModule } from '../users/users.module';
import { ReviewEntity } from './entities/review.entity';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { ReviewImageEntity } from '../common/images/entities/review-image.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([ReviewEntity, ReviewImageEntity]),
    UsersModule,
    AuthModule,
    ImagesModule,
    forwardRef(() => PlaceModule),
    forwardRef(() => BookingModule),
  ],
  controllers: [ReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}
