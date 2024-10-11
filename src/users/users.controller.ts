import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { RegisterUserRequestDto } from './dto/register-user-request.dto';
import { FindUserEmailRequestDto } from './dto/find-user-email-request.dto';
import { FindUserPasswordRequestDto } from './dto/find-user-password-request.dto';
import { UpdateUserRequestDto } from './dto/update-user-request.dto';
import { AccessTokenGuard } from '../auth/guard/bearer-token.guard';
import { User } from '../common/decorator/user/user.decorator';
import { UpdateUserPasswordRequestDto } from './dto/update-user-password-request.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadFileInterceptor } from '../common/decorator/upload/upload-file-interceptor.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * 회원 가입 함수
   * @param user
   */
  @Post()
  async createUser(@Body() user: RegisterUserRequestDto) {
    return this.usersService.createUser(user);
  }

  /**
   * 이메일(로그인 ID) 찾기 함수
   * @param user
   */
  @Get('find-email')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async findUserEmail(@Query() user: FindUserEmailRequestDto) {
    return this.usersService.findUserEmail(user);
  }

  /**
   * 비밀번호 찾기 함수
   * @param user
   */
  @Get('find-password')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async findUserPassword(@Query() user: FindUserPasswordRequestDto) {
    return this.usersService.findUserPassword(user);
  }

  /**
   * 비밀번호 확인 함수
   * @param userEmail
   * @param password
   */
  @Post('verify-password')
  @UseGuards(AccessTokenGuard)
  async verifyPassword(
    @User('email') userEmail: string,
    @Body('password') password: string,
  ) {
    return await this.usersService.verifyPassword(userEmail, password);
  }

  /**
   * 회원 정보 수정 함수
   * @param userEmail
   * @param user
   */
  @Patch()
  @UseGuards(AccessTokenGuard)
  async updateUser(
    @User('email') userEmail: string,
    @Body() user: UpdateUserRequestDto,
  ) {
    return this.usersService.updateUser(userEmail, user);
  }

  /**
   * 비밀번호 변경 함수
   * @param userEmail
   * @param user
   */
  @Patch('password')
  @UseGuards(AccessTokenGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async updateUserPassword(
    @User('email') userEmail: string,
    @Body() user: UpdateUserPasswordRequestDto,
  ) {
    return this.usersService.updateUserPassword(userEmail, user);
  }

  /**
   * 프로필 이미지 업로드 함수
   * @param userEmail
   * @param file
   */
  @Post('profile/upload')
  @UploadFileInterceptor()
  @UseGuards(AccessTokenGuard)
  async uploadUserProfileImage(
    @User('email') userEmail: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.usersService.uploadUserProfileImage(userEmail, file);
  }
}
