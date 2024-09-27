import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UsersEntity } from '../../users/entities/users.entity';
import { ReviewEntity } from '../../reviews/entities/review.entity';

@Entity('likes', { schema: 'foori' })
export class LikeEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', type: 'int' })
  userId: number;

  @Column({ name: 'review_id', type: 'int' })
  reviewId: number;

  @ManyToOne(() => UsersEntity, (user) => user.likes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UsersEntity;

  @ManyToOne(() => ReviewEntity, (review) => review.likes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'review_id' })
  review: ReviewEntity;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}
