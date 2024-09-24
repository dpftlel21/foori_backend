import { BaseModel } from '../../common/entities/base-model';
import { Column, Entity } from 'typeorm';

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
}
