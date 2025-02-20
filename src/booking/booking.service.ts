import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { BookingMenusService } from '../booking-menus/booking-menus.service';
import { MenusService } from '../menus/menus.service';
import { RestaurantEntity } from '../place/entities/restaurant.entity';
import { PlaceService } from '../place/place.service';
import { UsersService } from '../users/users.service';
import { CancelBookingPaymentRequestDto } from './dto/cancel-booking-payment-request.dto';
import { ConfirmPaymentRequestDto } from './dto/confirm-payment-reqeust.dto';
import { CreateBookingRequestDto } from './dto/create-booking-request.dto';
import { BookingEntity } from './entities/booking.entity';

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

    const bookingDate = createRequestDto.bookingDateTime.slice(0, 10); // "YYYY-MM-DD"
    const bookingTime = createRequestDto.bookingDateTime.slice(11, 19); // "HH:mm:ss"

    await this.verifyPossibleBooking(
      findUser.email,
      bookingDate, // Date 객체 대신 문자열 전달
      bookingTime, // Date 객체 대신 문자열 전달
      createRequestDto,
    );

    const orderId = await this.createOrderId(
      createRequestDto.restaurant.restaurantId,
    );

    const createdBooking = this.bookingRepository.create({
      bookingDate: bookingDate,
      bookingTime: bookingTime,
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
    userEmail: string,
    bookingDate: string,
    bookingTime: string,
    createRequestDto: CreateBookingRequestDto,
  ) {
    const findUser = await this.userService.findUserByEmail(userEmail);

    const findRestaurant = await this.placeService.findRestaurantById(
      createRequestDto.restaurant.restaurantId,
    );

    const existingBooking = await this.bookingRepository
      .createQueryBuilder('booking')
      .leftJoin('booking.user', 'user')
      .leftJoin('booking.restaurant', 'restaurant')
      .where('user.email = :userEmail', { userEmail: findUser.email })
      .andWhere('restaurant.id = :restaurantId', {
        restaurantId: findRestaurant.id,
      })
      .andWhere('booking.booking_date = :bookingDate', { bookingDate }) // 문자열 비교
      .andWhere('booking.booking_time = :bookingTime', { bookingTime }) // 문자열 비교
      .getOne();

    if (existingBooking) {
      throw new BadRequestException('해당 시간에 예약한 내역이 있습니다.');
    }

    // 3시간 이후 예약만 가능하도록 수정
    // 받은 시간을 기준으로 계산.
    const bookingDateTime = new Date(
      bookingDate + 'T' + bookingTime + '+09:00',
    ); //KST
    const now = new Date();

    // Calculate the difference in milliseconds
    const diff = bookingDateTime.getTime() - now.getTime();

    // Convert milliseconds to hours
    const diffHours = diff / (1000 * 60 * 60);
    if (diffHours < 3) {
      throw new BadRequestException(
        '현재 시간보다 3시간 이후의 예약만 가능합니다.',
      );
    }
  }

  async cancelPaymentBooking(
    userEmail: string,
    cancelPaymentDto: CancelBookingPaymentRequestDto,
  ): Promise<void> {
    const { orderId, cancelReason, paymentKey } = cancelPaymentDto; // paymentKey 추가

    // 예약 정보 조회
    const findBooking = await this.findBookingByOrderId(userEmail, orderId);

    // 예약 정보가 없는 경우
    if (!findBooking) {
      throw new NotFoundException('해당 예약 정보를 찾을 수 없습니다.');
    }

    // 예약자와 요청자가 일치하는지 확인
    if (findBooking.user.email !== userEmail) {
      throw new BadRequestException('예약 취소 권한이 없습니다.');
    }

    // 예약 상태가 취소 가능한 상태인지 확인
    if (findBooking.status !== 9 && findBooking.paymentStatus !== 9) {
      throw new BadRequestException('취소할 수 없는 예약 상태입니다.');
    }

    await this.isBookingCancellationAllowed(findBooking);

    // 토스페이먼츠 결제 취소 API 호출
    const widgetSecretKey = this.configService.get<string>('TOSS_SECRET_KEY');
    const encryptedSecretKey =
      'Basic ' + Buffer.from(widgetSecretKey + ':').toString('base64');

    // const queryRunner = this.dataSource.createQueryRunner();
    // await queryRunner.connect();
    // await queryRunner.startTransaction();

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `https://api.tosspayments.com/v1/payments/${paymentKey}/cancel`, // paymentKey를 URL에 포함
          {
            cancelReason: cancelReason,
          },
          {
            headers: {
              Authorization: encryptedSecretKey,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      // 예약 상태 업데이트
      await this.bookingRepository.update(findBooking.id, {
        paymentStatus: 9, // PaymentStatus.Completed
        status: 9, // BookingStatus.Confirmed
      });

      // TODO: 알림 보내기

      // await queryRunner.commitTransaction();
      return response.data;
    } catch (error) {
      // await queryRunner.rollbackTransaction();
      if (error instanceof AxiosError) {
        console.error(error.response.data);
        throw new InternalServerErrorException(
          '결제 취소에 실패했습니다.',
          error.response.data,
        );
      } else {
        console.error(error);
        throw new InternalServerErrorException(
          '결제 취소 중 오류가 발생했습니다.',
        );
      }
    } finally {
      // await queryRunner.release();
    }
  }

  private async isBookingCancellationAllowed(
    booking: BookingEntity,
  ): Promise<void> {
    const now = new Date();
    const bookingDateTime = new Date(booking.bookingDate); // 예약 날짜
    bookingDateTime.setHours(
      booking.bookingTime.getHours(),
      booking.bookingTime.getMinutes(),
      0, // 초, 밀리초 0으로 설정
      0,
    );

    const oneDayInMilliseconds = 24 * 60 * 60 * 1000; // 1일을 밀리초로 변환
    const oneDayBeforeBooking = new Date(
      bookingDateTime.getTime() - oneDayInMilliseconds,
    ); // 예약 하루 전

    if (now > oneDayBeforeBooking) {
      throw new BadRequestException('예약 하루 전까지만 취소가 가능합니다.');
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

  async getMyMonthlyStats(userEmail: string, from: string, to: string) {
    const findUser = await this.userService.findUserByEmail(userEmail);
    const userId = findUser.id;

    const startDate = new Date(from);
    const endDate = new Date(to);

    const lastMonthStartDate = new Date(
      startDate.getFullYear(),
      startDate.getMonth() - 1,
      1,
    );
    const lastMonthEndDate = new Date(
      startDate.getFullYear(),
      startDate.getMonth(),
      0,
    );

    const result = await this.bookingRepository
      .createQueryBuilder('b')
      .select([
        'r.category AS category',
        'COUNT(b.id) AS categoryCount', // 카테고리별 예약 횟수 (이번 달)
        '(SELECT SUM(b2.total_price) FROM bookings b2 WHERE b2.user_id = :userId) AS sumPrice', // 총 소비액
        '(SELECT SUM(b2.total_price) FROM bookings b2 WHERE b2.user_id = :userId AND b2.booking_date BETWEEN :lastMonthStartDate AND :lastMonthEndDate) AS beforeSumPrice', // 지난달 총 소비액
        '(SELECT AVG(b2.total_price) FROM bookings b2 WHERE b2.user_id = :userId) AS myAvgPrice', // 평균 소비액
        '(SELECT AVG(total_price) FROM bookings) AS totalUserAvgPrice', // 전체 평균
      ])
      .addSelect((subQuery) => {
        // 가장 많이 방문한 카테고리
        return subQuery
          .select('r_inner.category')
          .from(BookingEntity, 'b_inner')
          .innerJoin(
            RestaurantEntity,
            'r_inner',
            'b_inner.restaurant_id = r_inner.id',
          )
          .where('b_inner.user_id = :userId', { userId })
          .andWhere('b_inner.booking_date BETWEEN :startDate AND :endDate', {
            startDate,
            endDate,
          })
          .groupBy('r_inner.category')
          .orderBy('COUNT(*)', 'DESC')
          .limit(1);
      }, 'MyMaxVisit')
      .addSelect((subQuery) => {
        // 가장 많이 방문한 카테고리 횟수
        return subQuery
          .select('count(r_inner.category)')
          .from(BookingEntity, 'b_inner')
          .innerJoin(
            RestaurantEntity,
            'r_inner',
            'b_inner.restaurant_id = r_inner.id',
          )
          .where('b_inner.user_id = :userId', { userId })
          .andWhere('b_inner.booking_date BETWEEN :startDate AND :endDate', {
            startDate,
            endDate,
          })
          .groupBy('r_inner.category')
          .orderBy('COUNT(*)', 'DESC')
          .limit(1);
      }, 'MyMaxVisitCount')
      .innerJoin('b.restaurant', 'r') // INNER JOIN
      .where('b.user_id = :userId', { userId }) // 사용자 ID 조건
      .andWhere('b.booking_date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      }) // 이번 달 조건
      .groupBy('r.category') // 카테고리별 그룹화
      .orderBy('categoryCount', 'DESC') // 예약 횟수 내림차순 정렬
      .setParameter('lastMonthStartDate', lastMonthStartDate) // 파라미터 바인딩
      .setParameter('lastMonthEndDate', lastMonthEndDate) // 파라미터 바인딩
      .setParameter('startDate', startDate)
      .setParameter('endDate', endDate)
      .getRawMany();

    return result;
  }

  // async cancelBooking(userEmail: string, bookingId: number) {
  //   try {
  //     const findUser = await this.userService.findUserByEmail(userEmail);
  //     const findBooking = await this.bookingRepository.findOneOrFail({
  //       where: {
  //         id: bookingId,
  //         user: { id: findUser.id },
  //       },
  //     });
  //     if (findBooking.status === 9) {
  //       throw new BadRequestException('이미 취소된 예약입니다.');
  //     } else {
  //       await this.isBookingCancellable(findBooking);
  //       Object.assign(findBooking, { status: 9 });
  //       await this.bookingRepository.save(findBooking);
  //     }
  //   } catch (error) {
  //     if (error instanceof EntityNotFoundError) {
  //       throw new NotFoundException('일치하는 예약 정보가 없습니다.');
  //     } else if (error instanceof BadRequestException) {
  //       throw error;
  //     } else {
  //       throw new InternalServerErrorException(
  //         '예약 취소 중 오류가 발생했습니다.',
  //       );
  //     }
  //   }
  // }
  //
  // async isBookingCancellable(booking: BookingEntity): Promise<void> {
  //   const bookingDateTime = new Date(
  //     `${booking.bookingDate.toISOString().split('T')[0]}T${booking.bookingTime}`,
  //   );
  //
  //   const currentTime = new Date();
  //   const oneHourLater = new Date(currentTime.getTime() + 60 * 60 * 1000);
  //
  //   if (bookingDateTime <= oneHourLater) {
  //     throw new BadRequestException(
  //       '예약 시간 1시간 이내로 남은 예약건은 취소가 불가능합니다.',
  //     );
  //   }
  // }
}
