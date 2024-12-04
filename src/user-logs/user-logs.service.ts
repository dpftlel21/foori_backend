import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserLogsEntity } from '../users/entities/user-logs.entity';
import { LessThanOrEqual, Repository } from 'typeorm';
import { UsersService } from '../users/users.service';

@Injectable()
export class UserLogsService {
  constructor(
    @InjectRepository(UserLogsEntity)
    private readonly userLogsRepository: Repository<UserLogsEntity>,
    @Inject(forwardRef(() => UsersService))
    private readonly userService: UsersService,
  ) {}

  /**
   * 사용자 로그 정보 생성 함수(회원가입 시)
   * @param userEmail
   */
  async createUserLogs(userEmail: string) {
    const findUser = await this.userService.findUserByEmail(userEmail);

    const now = new Date();

    const createdUserLogs = this.userLogsRepository.create({
      userId: findUser.id,
      lastLoginAt: new Date(),
      changePasswordAt: new Date(),
      nextNotificationDate: this.addDays(now, 90), // 비밀번호 변경 알림 예정일: 90일 후
      nextDormantCheckDate: this.addDays(now, 365), // 휴면 계정 전환 예정일: 1년 후
    });

    return await this.userLogsRepository.save(createdUserLogs);
  }

  /**
   * 사용자 로그 정보 갱신 함수(로그인 시)
   * @param userEmail
   */
  async updateUserLogsByLogin(userEmail: string) {
    const findUser = await this.userService.findUserByEmail(userEmail);

    const now = new Date();

    const updateUserLogs = await this.userLogsRepository.findOneOrFail({
      where: { userId: findUser.id },
    });

    updateUserLogs.lastLoginAt = new Date();
    Object.assign(updateUserLogs, {
      lastLoginAt: new Date(),
      nextDormantCheckDate: this.addDays(now, 365), // 휴면 계정 전환 예정일: 1년 후
    });

    return await this.userLogsRepository.save(updateUserLogs);
  }

  /**
   * 사용자 로그 정보 갱신 함수(비밀번호 변경 시)
   * @param userEmail
   */
  async updateUserLogsByChangePassword(userEmail: string) {
    const findUser = await this.userService.findUserByEmail(userEmail);

    const now = new Date();

    const updateUserLogs = await this.userLogsRepository.findOneOrFail({
      where: { userId: findUser.id },
    });

    updateUserLogs.changePasswordAt = new Date();
    Object.assign(updateUserLogs, {
      changePasswordAt: new Date(),
      nextNotificationDate: this.addDays(now, 90), // 비밀번호 변경 알림 예정일: 90일 후
    });

    return await this.userLogsRepository.save(updateUserLogs);
  }

  /**
   * 사용자 로그 정보 조회 함수
   * @param userEmail
   */
  async findUserLogsByUserEmail(userEmail: string) {
    try {
      const findUser = await this.userService.findUserByEmail(userEmail);
      const findUserLog = await this.userLogsRepository.findOneOrFail({
        where: { userId: findUser.id },
      });
      if (findUserLog.nextDormantCheckDate <= new Date()) {
        throw new BadRequestException(
          '휴면 계정으로 전환되었습니다. 메일 인증 후 서비스 이용이 가능합니다.',
        );
      }
    } catch (error) {
      throw new NotFoundException('일치하는 사용자 로그 정보가 없습니다.');
    }
  }

  /**
   * 날짜 연산 함수
   * @param date
   * @param days
   * @private
   */
  private addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  /**
   * 사용자 휴면 전환 로그 정보 전체 조회 함수(스케줄링 및 관리자용)
   */
  async findAllUserLogsForDormantCheck() {
    const now = new Date();
    return await this.userLogsRepository.find({
      where: { nextDormantCheckDate: LessThanOrEqual(now) },
    });
  }

  /**
   * 사용자 비밀번호 변경 알림 로그 정보 전체 조회 함수(스케줄링 및 관리자용)
   */
  async findAllUserLogsForPasswordChangeNotification() {
    const now = new Date();
    return await this.userLogsRepository.find({
      where: { nextNotificationDate: LessThanOrEqual(now) },
    });
  }
}
