import {
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export abstract class BaseModel {
  @PrimaryGeneratedColumn('identity', {
    type: 'int',
    name: 'user_id',
    comment: '고유번호(PK)',
  })
  id: number;
  @CreateDateColumn({
    type: 'date',
    name: 'created_at',
    nullable: false,
    comment: '생성일자',
  })
  createdAt: Date;
  @UpdateDateColumn({
    type: 'date',
    name: 'updated_at',
    nullable: false,
    comment: '수정일자',
  })
  updatedAt: Date;
}
