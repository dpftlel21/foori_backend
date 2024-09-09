import { Test, TestingModule } from '@nestjs/testing';
import { UesrsController } from './uesrs.controller';
import { UesrsService } from './uesrs.service';

describe('UesrsController', () => {
  let controller: UesrsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UesrsController],
      providers: [UesrsService],
    }).compile();

    controller = module.get<UesrsController>(UesrsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
