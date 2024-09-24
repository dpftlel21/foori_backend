import { BaseModel } from '../../entities/base-model';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { RestaurantEntity } from './restaurant.entity';

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
}
