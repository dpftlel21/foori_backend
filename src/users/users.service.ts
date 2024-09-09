import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersEntity } from './entities/users.entity';
import { Repository } from 'typeorm';
import { CreateUserRequestDto } from './dto/create-member-request.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersEntity)
    private readonly usersRepository: Repository<UsersEntity>,
  ) {}

  async createUser(user: CreateUserRequestDto) {
    await this.verifyExistUserInfo(user);

    const createdUser = await this.usersRepository.create({
      ...user,
    });

    return this.usersRepository.save(createdUser);
  }

  private async verifyExistUserInfo(user: CreateUserRequestDto) {
    const [loginIdExists, emailExists, phoneNumberExists] = await Promise.all([
      this.usersRepository.exists({ where: { loginId: user.loginId } }),
      this.usersRepository.exists({ where: { email: user.email } }),
      this.usersRepository.exists({ where: { phoneNumber: user.phoneNumber } }),
    ]);

    const errors = [];
    if (loginIdExists) errors.push('이미 존재하는 로그인 아이디입니다.');
    if (emailExists) errors.push('이미 존재하는 이메일입니다.');
    if (phoneNumberExists) errors.push('이미 존재하는 전화번호입니다.');

    if (errors.length > 0) {
      throw new BadRequestException(errors.join(', '));
    }
  }
}
