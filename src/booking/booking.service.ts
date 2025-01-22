import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BookingEntity } from './entities/booking.entity';
import { EntityNotFoundError, Repository } from 'typeorm';
import { CreateBookingRequestDto } from './dto/create-booking-request.dto';
import { PlaceService } from '../place/place.service';
import { UsersService } from '../users/users.service';
import { MenusService } from '../menus/menus.service';
import { BookingMenusService } from '../booking-menus/booking-menus.service';
import { ConfirmPaymentRequestDto } from './dto/confirm-payment-reqeust.dto';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(BookingEntity)
    private readonly bookingRepository: Repository<BookingEntity>,
    private readonly userService: UsersService,
    private readonly placeService: PlaceService,
    private readonly menusService: MenusService,
    private readonly bookingMenuService: BookingMenusService,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async createBooking(
    userEmail: string,
    createRequestDto: CreateBookingRequestDto,
  ) {
    const findUser = await this.userService.findUserByEmail(userEmail);

    const findRestaurant = await this.placeService.findRestaurantById(
      createRequestDto.restaurant.restaurantId,
    );

    await this.verifyPossibleBooking(createRequestDto);

    const bookingDate = new Date(
      createRequestDto.bookingDateTime.getFullYear(),
      createRequestDto.bookingDateTime.getMonth(),
      createRequestDto.bookingDateTime.getDate(),
    );

    const orderId = await this.createOrderId(
      createRequestDto.restaurant.restaurantId,
    );

    const createdBooking = this.bookingRepository.create({
      bookingDate: bookingDate,
      bookingTime: createRequestDto.bookingDateTime,
      numOfPeople: createRequestDto.numOfPeople,
      totalPrice: 0, // 초기값, 이후 메뉴 가격에 따라 업데이트
      paymentStatus: 1, // 결제 대기 상태
      status: 1, // 예약 대기 상태
      isReviewed: 0, // 리뷰 작성 안 함
      orderId: orderId,
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
      .leftJoin('booking.user', 'user')
      .leftJoin('booking.restaurant', 'restaurant')
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
        'booking.orderId',
        'user.name',
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

  async confirmPayment(
    userEmail: string,
    confirmPaymentDto: ConfirmPaymentRequestDto,
  ) {
    const findUser = await this.userService.findUserByEmail(userEmail);

    const { paymentKey, orderId, amount } = confirmPaymentDto;

    const findBooking = await this.findBookingByOrderId(
      findUser.email,
      orderId,
    );

    if (findBooking.totalPrice !== amount) {
      throw new BadRequestException('결제 금액이 일치하지 않습니다.');
    }

    if (findBooking.paymentStatus !== 1) {
      throw new BadRequestException('결제를 수행할 수 없습니다.');
    }

    const widgetSecretKey = this.configService.get<string>('TOSS_SECRET_KEY');
    const encryptedSecretKey =
      'Basic ' + Buffer.from(widgetSecretKey + ':').toString('base64');

    try {
      // 결제 승인 요청
      const response = await firstValueFrom(
        this.httpService.post(
          'https://api.tosspayments.com/v1/payments/confirm',
          {
            orderId: orderId,
            amount: amount,
            paymentKey: paymentKey,
          },
          {
            headers: {
              Authorization: encryptedSecretKey,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      // 결제 상태 및 예약 상태 업데이트
      await this.bookingRepository.update(findBooking.id, {
        paymentStatus: 2, // PaymentStatus.Completed
        status: 3, // BookingStatus.Confirmed
      });
      await this.bookingRepository.save(findBooking);

      return response.data;
    } catch (error) {
      // await queryRunner.rollbackTransaction();

      // 결제 실패 비즈니스 로직
      if (error instanceof AxiosError) {
        console.error(error.response.data);
        throw new InternalServerErrorException(
          '결제 승인에 실패했습니다.',
          error.response.data,
        );
      } else {
        console.error(error);
        throw new InternalServerErrorException(
          '결제 처리 중 오류가 발생했습니다.',
        );
      }
    } finally {
      // 정상작동 확인후 트랜잭션 설정
      // await queryRunner.release();
    }
  }

  private async verifyPossibleBooking(
    createRequestDto: CreateBookingRequestDto,
  ) {
    const threeHoursLater = new Date(new Date().getTime() + 3 * 60 * 60 * 1000);

    if (createRequestDto.bookingDateTime < threeHoursLater) {
      throw new BadRequestException(
        '현재 시간보다 3시간 이후의 예약만 가능합니다.',
      );
    }
  }

  private async createOrderId(restaurantId: number) {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[-:T.]/g, '');
    const uuid = uuidv4().replace(/-/g, '').substring(0, 12);

    const orderId = `${timestamp}${uuid}${restaurantId}`; // 타임스탬프 + UUID + bookingId 조합
    return orderId;
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
          'booking.orderId',
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

  async findBookingById(userEmail: string, bookingId: number) {
    try {
      const findUser = await this.userService.findUserByEmail(userEmail);

      return (
        this.bookingRepository
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
            'booking.orderId',
          ])
          // Restaurant에서 필요한 필드만 선택
          .leftJoin('booking.restaurant', 'restaurant')
          .addSelect([
            'restaurant.id',
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
          .andWhere('booking.id = :bookingId', { bookingId })
          .getOne()
      );
    } catch (error) {
      throw new NotFoundException(
        '일치하는 예약 정보가 없습니다.',
        error.message,
      );
    }
  }

  async findBookingByOrderId(userEmail: string, orderId: string) {
    try {
      const findUser = await this.userService.findUserByEmail(userEmail);

      return (
        this.bookingRepository
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
            'booking.orderId',
          ])
          // Restaurant에서 필요한 필드만 선택
          .leftJoin('booking.restaurant', 'restaurant')
          .addSelect([
            'restaurant.id',
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
          .andWhere('booking.orderId = :orderId', { orderId })
          .getOne()
      );
    } catch (error) {
      throw new NotFoundException(
        '일치하는 예약 정보가 없습니다.',
        error.message,
      );
    }
  }

  async updateBookingReviewedStatus(bookingId: number) {
    try {
      const findBooking = await this.bookingRepository.findOneOrFail({
        where: { id: bookingId },
      });

      Object.assign(findBooking, { isReviewed: 1 });
      await this.bookingRepository.save(findBooking);
    } catch (error) {
      throw new NotFoundException(
        '일치하는 예약 정보가 없습니다.',
        error.message,
      );
    }
  }

  async cancelBooking(userEmail: string, bookingId: number) {
    try {
      const findUser = await this.userService.findUserByEmail(userEmail);
      const findBooking = await this.bookingRepository.findOneOrFail({
        where: {
          id: bookingId,
          user: { id: findUser.id },
        },
      });
      if (findBooking.status === 9) {
        throw new BadRequestException('이미 취소된 예약입니다.');
      } else {
        await this.isBookingCancellable(findBooking);
        Object.assign(findBooking, { status: 9 });
        await this.bookingRepository.save(findBooking);
      }
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException('일치하는 예약 정보가 없습니다.');
      } else if (error instanceof BadRequestException) {
        throw error;
      } else {
        throw new InternalServerErrorException(
          '예약 취소 중 오류가 발생했습니다.',
        );
      }
    }
  }

  async isBookingCancellable(booking: BookingEntity): Promise<void> {
    const bookingDateTime = new Date(
      `${booking.bookingDate.toISOString().split('T')[0]}T${booking.bookingTime}`,
    );

    const currentTime = new Date();
    const oneHourLater = new Date(currentTime.getTime() + 60 * 60 * 1000);

    if (bookingDateTime <= oneHourLater) {
      throw new BadRequestException(
        '예약 시간 1시간 이내로 남은 예약건은 취소가 불가능합니다.',
      );
    }
  }
}
