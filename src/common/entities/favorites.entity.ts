import { UsersEntity } from '../../users/entities/users.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RestaurantEntity } from '../../place/entities/restaurant.entity';

@Entity('favorites', { schema: 'foori' })
export class FavoritesEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', type: 'int' })
  userId: number;

  @Column({ name: 'restaurant_id', type: 'int' })
  restaurantId: number;

  @ManyToOne(() => UsersEntity, (user) => user.favorites)
  @JoinColumn({ name: 'user_id' })
  user: UsersEntity;

  @ManyToOne(() => RestaurantEntity, (restaurant) => restaurant.favorites)
  @JoinColumn({ name: 'restaurant_id' })
  restaurant: RestaurantEntity;
}
