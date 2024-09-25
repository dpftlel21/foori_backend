import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BookingEntity } from '../../booking/entities/booking.entity';
import { MenuEntity } from '../../common/crawl/entities/menu.entity';

@Entity('booking_menus', { schema: 'foori' })
export class BookingMenuEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'quantity',
    type: 'int',
    comment: '메뉴 수량',
  })
  quantity: number;

  @ManyToOne(() => BookingEntity, (booking) => booking.bookingMenus, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'booking_id' })
  booking: BookingEntity;

  @ManyToOne(() => MenuEntity, (menu) => menu.bookingMenus, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'menu_id' })
  menu: MenuEntity;
}
