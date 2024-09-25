import { Column, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseModel } from '../../common/entities/base-model';
import { UsersEntity } from '../../users/entities/users.entity';
import { RestaurantEntity } from '../../common/crawl/entities/restaurant.entity';
import { MenuEntity } from '../../common/crawl/entities/menu.entity';
import { BookingMenuEntity } from '../../booking-menus/entities/booking-menus.entity';

export class BookingEntity extends BaseModel {
  @Column({
    name: 'reservation_time',
    type: 'timestamp',
    comment: '예약 시간',
  })
  reservationTime: Date;

  @Column({
    name: 'num_of_people',
    type: 'int',
    comment: '예약 인원 수',
  })
  numOfPeople: number;

  @Column({
    name: 'total_price',
    type: 'decimal',
    precision: 10,
    scale: 2,
    comment: '총 결제 금액',
  })
  totalPrice: number;

  @Column({
    name: 'payment_status',
    type: 'tinyint',
    comment: '결제 상태 (1: 결제 대기, 2: 결제 완료, 9: 결제 취소)',
    default: 1,
  })
  paymentStatus: number;

  @Column({
    name: 'status',
    type: 'tinyint',
    comment: '예약 상태 (1: 대기, 2: 신청 완료, 3: 확정, 9: 취소)',
    default: 1,
  })
  status: number;

  @Column({
    name: 'is_reviewed',
    type: 'tinyint',
    width: 1,
    default: 0,
    comment: '리뷰 작성 여부 (0: 작성 안 함, 1: 작성 완료)',
  })
  isReviewed: number; // 0 = false (리뷰 작성 안 함), 1 = true (리뷰 작성 완료)

  @ManyToOne(() => UsersEntity, (user) => user.bookings, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'user_id' })
  user: UsersEntity;

  @ManyToOne(() => RestaurantEntity, (restaurant) => restaurant.bookings, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'restaurant_id' })
  restaurant: RestaurantEntity;

  @OneToMany(() => BookingMenuEntity, (bookingMenu) => bookingMenu.booking, {
    cascade: true,
  })
  bookingMenus: BookingMenuEntity[];
}
