import { BaseModel } from '../../entities/base-model';
import { Column, Entity, ManyToOne } from 'typeorm';
import { RestaurantEntity } from './restaurant.entity';

@Entity('menus', { schema: 'foori' })
export class MenuEntity extends BaseModel {
  @Column()
  name: string;

  @Column()
  price: string;

  @ManyToOne(() => RestaurantEntity, (restaurant) => restaurant.menus, {
    onDelete: 'CASCADE',
  })
  restaurant: RestaurantEntity;
}
