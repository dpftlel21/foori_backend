import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SocialAccountsEntity } from '../users/entities/social-accounts.entity';
import { Repository } from 'typeorm';
import { CreateSocialAccountLinkRequestDto } from './dto/create-social-account-link-request.dto';

@Injectable()
export class SocialAccountsService {
  constructor(
    @InjectRepository(SocialAccountsEntity)
    private readonly socialAccountsRepository: Repository<SocialAccountsEntity>,
  ) {}

  /**
   * 소셜 계정을 생성하는 함수
   * @param userId
   * @param socialId
   * @param provider
   */
  async createSocialAccount(
    createSocialAccountLinkRequestDto: CreateSocialAccountLinkRequestDto,
  ) {
    const { userId, socialId, provider } = createSocialAccountLinkRequestDto;
    const createdSocialAccount = this.socialAccountsRepository.create({
      userId,
      socialId,
      provider,
    });

    return await this.socialAccountsRepository.save(createdSocialAccount);
  }

  /**
   * 소셜 계정의 유무를 검증하는 함수
   * @param userId
   * @param socialId
   * @param provider
   */
  async verifyExistSocialAccountBySocialIdAndUserIdAndProvicer(
    createSocialAccountLinkRequestDto: CreateSocialAccountLinkRequestDto,
  ) {
    const { userId, socialId, provider } = createSocialAccountLinkRequestDto;
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
