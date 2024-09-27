import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { LikesService } from './likes.service';
import { AccessTokenGuard } from '../../auth/guard/bearer-token.guard';
import { User } from '../decorator/user/user.decorator';

@Controller('likes')
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  // 좋아요 토글 기능
  @Post('toggle/:reviewId')
  @UseGuards(AccessTokenGuard)
  async toggleLike(
    @User('email') userEmail: string,
    @Param('reviewId', ParseIntPipe) reviewId: number,
  ) {
    // 좋아요 추가 및 삭제를 한번에 처리
    return this.likesService.toggleLike(userEmail, reviewId);
  }

  // @Post(':reviewId')
  // @UseGuards(AccessTokenGuard)
  // async addLike(
  //   @User('email') userEmail: string,
  //   @Param('reviewId', ParseIntPipe) reviewId: number,
  // ) {
  //   return this.likesService.addLike(userEmail, reviewId);
  // }
  //
  // @Delete(':reviewId')
  // @UseGuards(AccessTokenGuard)
  // async removeLike(
  //   @User('email') userEmail: string,
  //   @Param('reviewId', ParseIntPipe) reviewId: number,
  // ) {
  //   return this.likesService.removeLike(userEmail, reviewId);
  // }

  @Get(':reviewId')
  @UseGuards(AccessTokenGuard)
  async isLiked(
    @User('email') userEmail: string,
    @Param('reviewId', ParseIntPipe) reviewId: number,
  ) {
    return this.likesService.isLiked(userEmail, reviewId);
  }
}
