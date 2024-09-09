import { Test, TestingModule } from '@nestjs/testing';
import { UesrsService } from './uesrs.service';

describe('UesrsService', () => {
  let service: UesrsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UesrsService],
    }).compile();

    service = module.get<UesrsService>(UesrsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
