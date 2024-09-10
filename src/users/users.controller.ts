import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserRequestDto } from './dto/create-user-request.dto';
import { FindUserEmailRequestDto } from './dto/find-user-email-request.dto';
import { FindUserPasswordRequestDto } from './dto/find-user-password-request.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async createUser(@Body() user: CreateUserRequestDto) {
    return this.usersService.createUser(user);
  }

  @Get()
  async findUserEmail(@Query() user: FindUserEmailRequestDto) {
    return this.usersService.findUserEmail(user);
  }

  @Get()
  async findUserPassword(@Query() user: FindUserPasswordRequestDto) {
    return this.usersService.findUserPassword(user);
  }
}
