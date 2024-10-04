import { Test, TestingModule } from '@nestjs/testing';
import { SocialAccountsService } from './social-accounts.service';

describe('SocialAccountsService', () => {
  let service: SocialAccountsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SocialAccountsService],
    }).compile();

    service = module.get<SocialAccountsService>(SocialAccountsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
