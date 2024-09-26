import { BaseModel } from '../../common/entities/base-model';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { RestaurantEntity } from '../../place/entities/restaurant.entity';
import { BookingMenuEntity } from '../../booking-menus/entities/booking-menus.entity';

@Entity('menus', { schema: 'foori' })
export class MenuEntity extends BaseModel {
  @Column({
    name: 'menu_name',
    type: 'varchar',
    length: 100,
    comment: '메뉴명',
  })
  name: string;

  @Column({
    name: 'menu_price',
    type: 'varchar',
    length: 20,
  })
  price: string;

  @ManyToOne(() => RestaurantEntity, (restaurant) => restaurant.menus, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'restaurant_id' })
  restaurant: RestaurantEntity;

  @OneToMany(() => BookingMenuEntity, (bookingMenu) => bookingMenu.menu)
  bookingMenus: BookingMenuEntity[];
}
