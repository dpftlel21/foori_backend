import { Test, TestingModule } from '@nestjs/testing';
import { BookingMenusService } from './booking-menus.service';

describe('BookingMenusService', () => {
  let service: BookingMenusService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BookingMenusService],
    }).compile();

    service = module.get<BookingMenusService>(BookingMenusService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
