import { BaseModel } from '../../common/entities/base-model';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { UsersEntity } from '../../users/entities/users.entity';
import { RestaurantEntity } from '../../place/entities/restaurant.entity';

@Entity('reviews', { schema: 'foori' })
export class ReviewEntity extends BaseModel {
  @Column({
    name: 'content',
    type: 'varchar',
    length: 1000,
    comment: '리뷰 내용',
  })
  content: string;

  @Column({
    name: 'rating',
    type: 'int',
    comment: '평점',
  })
  rating: number;

  @Column({
    name: 'booking_id',
    type: 'int',
    nullable: true,
    comment: '예약 ID',
  })
  bookingId: number;

  @Column({ name: 'user_id', type: 'int', nullable: true })
  userId: number;

  @Column({ name: 'restaurant_id', type: 'int', nullable: true })
  restaurantId: number;

  @ManyToOne(() => UsersEntity, (user) => user.reviews, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: UsersEntity;

  @ManyToOne(() => RestaurantEntity, (restaurant) => restaurant.reviews, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'restaurant_id' })
  restaurant: RestaurantEntity;
}
