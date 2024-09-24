import {
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';

@Exclude({ toPlainOnly: true })
export abstract class BaseModel {
  @PrimaryGeneratedColumn({
    type: 'int',
    name: 'id',
    comment: '고유번호(PK)',
  })
  id: number;
  @CreateDateColumn({
    type: 'datetime',
    name: 'created_at',
    comment: '생성일',
  })
  createdAt: Date;
  @UpdateDateColumn({
    type: 'datetime',
    name: 'updated_at',
    comment: '수정일',
  })
  updatedAt: Date;
}
