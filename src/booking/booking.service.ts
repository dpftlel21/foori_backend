import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BookingEntity } from './entities/booking.entity';
import { Repository } from 'typeorm';
import { CreateBookingRequestDto } from './dto/create-booking-request.dto';
import { PlaceService } from '../place/place.service';
import { UsersService } from '../users/users.service';
import { MenusService } from '../menus/menus.service';
import { BookingMenusService } from '../booking-menus/booking-menus.service';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(BookingEntity)
    private readonly bookingRepository: Repository<BookingEntity>,
    private readonly userService: UsersService,
    private readonly placeService: PlaceService,
    private readonly menusService: MenusService,
    private readonly bookingMenuService: BookingMenusService,
  ) {}

  async createBooking(
    userEmail: string,
    createRequestDto: CreateBookingRequestDto,
  ) {
    const findUser = await this.userService.findUserByEmail(userEmail);

    const findRestaurant = await this.placeService.findRestaurantById(
      createRequestDto.restaurant.restaurantId,
    );

    const createdBooking = this.bookingRepository.create({
      bookingDate: new Date(createRequestDto.bookingDate),
      bookingTime: new Date(
        `${createRequestDto.bookingDate} ${createRequestDto.bookingTime}`,
      ),
      numOfPeople: createRequestDto.numOfPeople,
      totalPrice: 0, // 초기값, 이후 메뉴 가격에 따라 업데이트
      paymentStatus: 1, // 결제 대기 상태
      status: 1, // 예약 대기 상태
      isReviewed: 0, // 리뷰 작성 안 함
      user: findUser,
      restaurant: findRestaurant,
    });

    const savedBooking = await this.bookingRepository.save(createdBooking);

    let totalPrice = 0;
    for (const menuDto of createRequestDto.bookingMenus) {
      const menu = await this.menusService.findMenuById(
        menuDto.menuId,
        findRestaurant.id,
      );
      await this.bookingMenuService.createBookingMenu(
        savedBooking,
        menu,
        menuDto.quantity,
      );

      // 메뉴 가격 합산 (단가 * 수량)
      totalPrice += menu.price * menuDto.quantity;
    }

    // 5. 예약 총 금액 업데이트
    savedBooking.totalPrice = totalPrice;
    const responseBooking = await this.bookingRepository.save(savedBooking);

    // 필요한 필드만 가져오는 방식으로 응답
    const bookingResponse = await this.bookingRepository
      .createQueryBuilder('booking')
      .leftJoin('booking.user', 'user') // leftJoin 사용
      .leftJoin('booking.restaurant', 'restaurant') // leftJoin 사용
      .leftJoin('booking.bookingMenus', 'bookingMenu')
      .leftJoin('bookingMenu.menu', 'menu')
      .select([
        'booking.id',
        'booking.bookingDate',
        'booking.bookingTime',
        'booking.numOfPeople',
        'booking.totalPrice',
        'booking.paymentStatus',
        'booking.status',
        'booking.isReviewed',
        'user.name', // 필요한 필드만 선택
        'restaurant.name',
        'restaurant.address',
        'restaurant.locationNum',
        'restaurant.postalCode',
        'restaurant.telNum',
        'bookingMenu.quantity',
        'menu.name',
        'menu.price',
      ])
      .where('booking.id = :bookingId', { bookingId: responseBooking.id })
      .getOne();

    return bookingResponse;
  }

  async findBookingByUserEmail(userEmail: string) {
    try {
      const findUser = await this.userService.findUserByEmail(userEmail);

      return await this.bookingRepository
        .createQueryBuilder('booking')
        .select([
          'booking.id',
          'booking.bookingDate',
          'booking.bookingTime',
          'booking.numOfPeople',
          'booking.totalPrice',
          'booking.paymentStatus',
          'booking.status',
          'booking.isReviewed',
        ])
        // Restaurant에서 필요한 필드만 선택
        .leftJoin('booking.restaurant', 'restaurant')
        .addSelect([
          'restaurant.name',
          'restaurant.address',
          'restaurant.locationNum',
          'restaurant.postalCode',
          'restaurant.telNum',
        ])

        // BookingMenu 조인 및 menu_id, quantity 선택
        .leftJoin('booking.bookingMenus', 'bookingMenu')
        .addSelect(['bookingMenu.quantity'])

        // Menus 테이블에서 menu_name, menu_price 선택
        .leftJoin('bookingMenu.menu', 'menu')
        .addSelect(['menu.name', 'menu.price'])

        .where('booking.user_id = :userId', { userId: findUser.id })
        .getMany();
    } catch (error) {
      throw new NotFoundException(
        '일치하는 예약 정보가 없습니다.',
        error.message,
      );
    }
  }
}
