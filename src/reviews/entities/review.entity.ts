import { BaseModel } from '../../common/entities/base-model';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { UsersEntity } from '../../users/entities/users.entity';
import { RestaurantEntity } from '../../place/entities/restaurant.entity';
import { LikeEntity } from '../../common/entities/like.entity';
import { ReviewImageEntity } from '../../common/images/entities/review-image.entity';

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
    type: 'decimal',
    precision: 2, // 전체 자릿수
    scale: 1, // 소수점 이하 자릿수
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

  @OneToMany(() => LikeEntity, (like) => like.review)
  likes: LikeEntity[];

  @OneToMany(() => ReviewImageEntity, (image) => image.review)
  images: ReviewImageEntity[];
}
