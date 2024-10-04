import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { UsersEntity } from './users.entity';
import { SocialProvider } from '../../social-accounts/enum/social-provider';

@Entity('social_accounts')
@Unique(['socialId', 'provider']) // provider와 socialId의 복합 유니크 제약
export class SocialAccountsEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'social_id',
    type: 'varchar',
    length: 255,
    comment: '소셜 로그인 제공자에서 발급된 사용자 ID',
  })
  socialId: string;

  @Column({
    name: 'provider',
    type: 'enum',
    enum: SocialProvider,
    comment: '소셜 로그인 제공자',
  })
  provider: SocialProvider;

  @Column({
    name: 'user_id',
    type: 'int',
    comment: '사용자 ID',
  })
  userId: number;

  @ManyToOne(() => UsersEntity, (user) => user.socialAccounts)
  @JoinColumn({ name: 'userId' })
  user: UsersEntity;
}
