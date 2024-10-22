import {
  Controller,
  // Post
} from '@nestjs/common';
import { UserLogsService } from './user-logs.service';
// import { UsersService } from '../users/users.service';

@Controller('user-logs')
export class UserLogsController {
  constructor(
    private readonly userLogsService: UserLogsService,
    // private readonly userService: UsersService,
  ) {}

  /**
   * 기존 유저들의 로그 생성 API
   */
  // @Post('create-logs-for-existing-users')
  // async createLogsForExistingUsers() {
  //   // 모든 사용자 조회
  //   const users = await this.userService.findAllUsers();
  //
  //   const result = [];
  //
  //   for (const user of users) {
  //     try {
  //       // 각 사용자에 대해 로그 생성
  //       const log = await this.userLogsService.createUserLogs(user.email);
  //       result.push({ userId: user.id, status: 'success' });
  //     } catch (error) {
  //       result.push({
  //         userId: user.id,
  //         status: 'failed',
  //         reason: error.message,
  //       });
  //     }
  //   }
  //
  //   return result; // 처리 결과 반환
  // }
}
