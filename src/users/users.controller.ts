import { Body, Controller, Get, Patch, Post, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserRequestDto } from './dto/create-user-request.dto';
import { FindUserEmailRequestDto } from './dto/find-user-email-request.dto';
import { FindUserPasswordRequestDto } from './dto/find-user-password-request.dto';
import { UpdateUserRequestDto } from './dto/update-user-request.dto';

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

  // @Patch(':id')
  // async updateUser(@Body() user: UpdateUserRequestDto) {
  //   return this.usersService.updateUser(user);
  // }
}
