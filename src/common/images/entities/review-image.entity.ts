import { BaseModel } from 'src/common/entities/base-model';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { ReviewEntity } from '../../../reviews/entities/review.entity';

@Entity('reviews', { schema: 'foori' })
export class ReviewImageEntity extends BaseModel {
  @Column({
    name: 'review_image_url',
    type: 'varchar',
    length: 500,
    comment: '이미지 URL',
  })
  imageUrl: string;

  @Column({
    name: 'review_image_key',
    type: 'varchar',
    length: 255,
    comment: '이미지 key',
  })
  imageKey: string;

  @ManyToOne(() => ReviewEntity, (review) => review.images, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'review_id' })
  review: ReviewEntity;
}
