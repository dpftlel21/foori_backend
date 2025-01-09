import { forwardRef, Module } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewEntity } from './entities/review.entity';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';
import { BookingModule } from '../booking/booking.module';
import { PlaceModule } from '../place/place.module';
import { ReviewImageEntity } from '../common/images/entities/review-image.entity';
import { ImagesModule } from '../common/images/images.module';

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
