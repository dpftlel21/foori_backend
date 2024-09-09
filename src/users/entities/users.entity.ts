import { Column, Entity } from 'typeorm';
import { BaseModel } from '../../common/entities/base-model';

@Entity('users', { schema: 'foori' })
export class UsersEntity extends BaseModel {
  @Column({
    name: 'user_name',
    type: 'varchar',
    length: 40,
  })
  name: string;
  @Column({
    name: 'login_id',
    type: 'varchar',
    length: 40,
    unique: true,
    update: false,
  })
  loginId: string;
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
    name: 'email',
    type: 'varchar',
    length: 100,
    unique: true,
  })
  email: string;
  @Column({
    name: 'phone_number',
    type: 'varchar',
    length: 15,
    unique: true,
  })
  phoneNumber: string;
}
