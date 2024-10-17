import { Test, TestingModule } from '@nestjs/testing';
import { MypageController } from './mypage.controller';
import { MypageService } from './mypage.service';

describe('MypageController', () => {
  let controller: MypageController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MypageController],
      providers: [MypageService],
    }).compile();

    controller = module.get<MypageController>(MypageController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
