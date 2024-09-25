import { Test, TestingModule } from '@nestjs/testing';
import { BookingMenusController } from './booking-menus.controller';
import { BookingMenusService } from './booking-menus.service';

describe('BookingMenusController', () => {
  let controller: BookingMenusController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookingMenusController],
      providers: [BookingMenusService],
    }).compile();

    controller = module.get<BookingMenusController>(BookingMenusController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
