import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SocialAccountsEntity } from '../users/entities/social-accounts.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SocialAccountsService {
  constructor(
    @InjectRepository(SocialAccountsEntity)
    private readonly socialAccountsRepository: Repository<SocialAccountsEntity>,
  ) {}

  async createSocialAccount(
    userId: number,
    socialId: string,
    provider: string,
  ) {
    const createdSocialAccount = this.socialAccountsRepository.create({
      userId,
      socialId,
      provider,
    });

    return await this.socialAccountsRepository.save(createdSocialAccount);
  }

  async findSocialAccountBySocialIdAndUserIdAndProvicer(
    userId: number,
    socialId: string,
    provider: string,
  ) {
    try {
      const findSocialAccount = this.socialAccountsRepository.findOneOrFail({
        where: {
          userId,
          socialId,
          provider,
        },
      });

      return findSocialAccount;
    } catch (error) {
      console.error('일치하는 정보가 없습니다.');
    }
  }
}
