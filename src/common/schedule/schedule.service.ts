import { Injectable } from '@nestjs/common';
import { UserLogsService } from '../../user-logs/user-logs.service';
import { Cron } from '@nestjs/schedule';
import { UsersService } from '../../users/users.service';

@Injectable()
export class ScheduleService {
  constructor(
    private readonly userLogsService: UserLogsService,
    private readonly userService: UsersService,
  ) {}

  /**
   * 매월 오전 3시 휴면 계정 전환 처리 함수
   */
  @Cron('0 3 1 * *')
  async checkDormantAccounts() {
    const now = new Date();
    const allUserLogs =
      await this.userLogsService.findAllUserLogsForDormantCheck(); // Service의 메서드 호출

    for (const log of allUserLogs) {
      if (log.nextDormantCheckDate <= now) {
        // 유저 상태 휴면으로 업데이트
        await this.userService.updateUserStatusToDormant(log.userId);
      }
    }
  }

  /**
   * 매주 오전 3시 비밀번호 변경 알림 처리 함수
   */
  @Cron('0 3 * * 0')
  async notifyPasswordChange() {
    const now = new Date();
    const allUserLogs =
      await this.userLogsService.findAllUserLogsForPasswordChangeNotification(); // Service의 메서드 호출

    for (const log of allUserLogs) {
      if (log.nextNotificationDate <= now) {
        // 비밀번호 변경 알림 메일 발송
        await this.userService.sendPasswordChangeNotification(log.userId);
      }
    }
  }
}
