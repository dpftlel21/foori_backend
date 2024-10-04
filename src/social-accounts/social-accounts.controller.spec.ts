import { Test, TestingModule } from '@nestjs/testing';
import { SocialAccountsController } from './social-accounts.controller';
import { SocialAccountsService } from './social-accounts.service';

describe('SocialAccountsController', () => {
  let controller: SocialAccountsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SocialAccountsController],
      providers: [SocialAccountsService],
    }).compile();

    controller = module.get<SocialAccountsController>(SocialAccountsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
