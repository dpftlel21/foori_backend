import { Column, Entity, OneToMany } from 'typeorm';
import { BaseModel } from '../../common/entities/base-model';
import { Exclude, Expose } from 'class-transformer';
import { ReviewEntity } from '../../reviews/entities/review.entity';
import { BookingEntity } from '../../booking/entities/booking.entity';
import { LikeEntity } from '../../common/entities/like.entity';
import { FavoritesEntity } from '../../common/entities/favorites.entity';
import { SocialAccountsEntity } from './social-accounts.entity';
import * as bcrypt from 'bcryptjs';

@Exclude({ toPlainOnly: true })
@Entity('users', { schema: 'foori' })
export class UsersEntity extends BaseModel {
  @Column({
    name: 'user_name',
    type: 'varchar',
    length: 40,
  })
  @Expose()
  name: string;

  @Column({
    name: 'email',
    type: 'varchar',
    length: 100,
    unique: true,
  })
  @Expose()
  email: string;

  @Column({
    name: 'password',
    type: 'varchar',
    length: 150,
  })
  password: string;

  @Column({
    name: 'date_of_birth',
    type: 'date',
    update: false,
  })
  birth: Date;

  @Column({
    name: 'phone_number',
    type: 'varchar',
    length: 15,
    unique: true,
  })
  phoneNumber: string;

  @Column({
    name: 'status',
    type: 'tinyint',
    default: 1,
    comment: '사용자 상태(1: 일반회원, 2: 소설회원, 4: 휴면회원 9: 탈퇴회원)',
  })
  status: number;

  @Column({
    name: 'profile_image_uri',
    type: 'varchar',
    length: 500,
  })
  profileImageUri: string;

  @Column({
    name: 'profile_image_key',
    type: 'varchar',
    length: 200,
    nullable: true,
  })
  profileImageKey: string;

  @Expose()
  createdAt: Date;

  @OneToMany(() => ReviewEntity, (review) => review.user)
  reviews: ReviewEntity[];

  @OneToMany(() => BookingEntity, (booking) => booking.user)
  bookings: BookingEntity[];

  @OneToMany(() => LikeEntity, (like) => like.user)
  likes: LikeEntity[];

  @OneToMany(() => FavoritesEntity, (favorites) => favorites.user)
  favorites: FavoritesEntity[];

  @OneToMany(() => SocialAccountsEntity, (socialAccount) => socialAccount.user)
  socialAccounts: SocialAccountsEntity[];

  async setPassword(newPassword: string, hashRound: number) {
    this.password = await bcrypt.hash(newPassword, hashRound);
  }
}
