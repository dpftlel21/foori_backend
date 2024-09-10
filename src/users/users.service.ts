import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersEntity } from './entities/users.entity';
import { Repository } from 'typeorm';
import { CreateUserRequestDto } from './dto/create-user-request.dto';
import { FindUserPasswordRequestDto } from './dto/find-user-password-request.dto';
import { FindUserEmailRequestDto } from './dto/find-user-email-request.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersEntity)
    private readonly usersRepository: Repository<UsersEntity>,
  ) {}

  /**
   * 회원 가입 함수
   * @param user
   */
  async createUser(user: CreateUserRequestDto) {
    await this.verifyNonExistUserInfo(user);

    const createdUser = this.usersRepository.create({
      ...user,
    });

    return await this.usersRepository.save(createdUser);
  }

  /**
   * 회원 이메일 찾기 함수
   * @param user
   */
  async findUserEmail(user: FindUserEmailRequestDto) {
    try {
      const findUser = await this.usersRepository.findOneOrFail({
        where: {
          name: user.name,
          phoneNumber: user.phoneNumber,
        },
      });

      return findUser.id;
    } catch (error) {
      throw new BadRequestException('일치하는 정보가 없습니다.');
    }
  }

  /**
   * 회원 비밀번호 찾기 함수
   * @param user
   */
  async findUserPassword(user: FindUserPasswordRequestDto) {
    try {
      const findUser = await this.usersRepository.findOne({
        where: {
          email: user.email,
          name: user.name,
          phoneNumber: user.phoneNumber,
        },
      });

      return findUser.password;
    } catch (error) {
      throw new BadRequestException('일치하는 정보가 없습니다.');
    }
  }

  /**
   * 회원 가입 시 중복된 정보를 확인하는 함수
   * @param user
   */
  private async verifyNonExistUserInfo(user: CreateUserRequestDto) {
    const [emailExists, phoneNumberExists] = await Promise.all([
      this.usersRepository.exists({ where: { email: user.email } }),
      this.usersRepository.exists({ where: { phoneNumber: user.phoneNumber } }),
    ]);

    const errors = [];
    if (emailExists) errors.push('이미 존재하는 이메일입니다.');
    if (phoneNumberExists) errors.push('이미 존재하는 전화번호입니다.');

    if (errors.length > 0) {
      throw new BadRequestException(errors.join(', '));
    }
  }
}
