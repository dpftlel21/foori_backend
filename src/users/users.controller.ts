import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Query,
  UseGuards,
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

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async createUser(@Body() user: RegisterUserRequestDto) {
    return this.usersService.createUser(user);
  }

  @Get('find-email')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async findUserEmail(@Query() user: FindUserEmailRequestDto) {
    return this.usersService.findUserEmail(user);
  }

  @Get('find-password')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async findUserPassword(@Query() user: FindUserPasswordRequestDto) {
    return this.usersService.findUserPassword(user);
  }

  @Post('verify-password')
  @UseGuards(AccessTokenGuard)
  async verifyPassword(
    @User('email') userEmail: string,
    @Body('password') password: string,
  ) {
    return await this.usersService.verifyPassword(userEmail, password);
  }

  // @Patch(':id')
  // async updateUser(@Body() user: UpdateUserRequestDto) {
  //   return this.usersService.updateUser(user);
  // }
}
