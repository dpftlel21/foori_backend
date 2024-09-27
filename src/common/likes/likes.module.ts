import { Module } from '@nestjs/common';
import { LikesService } from './likes.service';
import { LikesController } from './likes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LikeEntity } from '../entities/like.entity';
import { ReviewsModule } from '../../reviews/reviews.module';
import { AuthModule } from '../../auth/auth.module';
import { UsersModule } from '../../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([LikeEntity]),
    ReviewsModule,
    AuthModule,
    UsersModule,
  ],
  controllers: [LikesController],
  providers: [LikesService],
})
export class LikesModule {}