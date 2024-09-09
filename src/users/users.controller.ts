import { Body, Controller, Get, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserRequestDto } from './dto/create-member-request.dto';
import { FindUserRequestDto } from './dto/find-user-request.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async createUser(@Body() user: CreateUserRequestDto) {
    return this.usersService.createUser(user);
  }

  @Get()
  async findMyAccount(@Body() user: FindUserRequestDto) {
    return this.usersService.findUserByEmailAndPassword(user);
  }
}
