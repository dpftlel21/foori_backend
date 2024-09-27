import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('user_logs', { schema: 'foori' })
export class UserLogsEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'last_login_at',
    type: 'date',
    comment: '마지막 로그인 일시',
  })
  lastLoginAt: Date;

  @Column({
    name: 'change_password_at',
    type: 'date',
    comment: '비밀번호 변경 일시',
  })
  changePasswordAt: Date;

  @Column({
    name: 'user_id',
    type: 'int',
    comment: '사용자 ID',
  })
  userId: number;
}
