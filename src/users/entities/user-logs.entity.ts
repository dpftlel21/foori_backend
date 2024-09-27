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
    name: 'next_dormant_check_date',
    type: 'date',
    comment: '휴면 상태 전환 예정일',
  })
  nextDormantCheckDate: Date;

  @Column({
    name: 'next_notification_date',
    type: 'date',
    comment: '다음 비밀번호 변경 알림 예정일',
  })
  nextNotificationDate: Date;

  @Column({
    name: 'user_id',
    type: 'int',
    comment: '사용자 ID',
  })
  userId: number;
}
