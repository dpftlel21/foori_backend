import { Column, Entity } from 'typeorm';
import { BaseModel } from '../../common/entities/base-model';
import { Exclude, Expose } from 'class-transformer';

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

  @Expose()
  createdAt: Date;
}
