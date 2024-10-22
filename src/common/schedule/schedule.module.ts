import { Module } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { ScheduleModule as Schedule } from '@nestjs/schedule';
import { ScheduleController } from './schedule.controller';
import { UserLogsModule } from '../../user-logs/user-logs.module';
import { UsersModule } from '../../users/users.module';

@Module({
  imports: [Schedule.forRoot(), UserLogsModule, UsersModule],
  controllers: [ScheduleController],
  providers: [ScheduleService],
})
export class ScheduleModule {}
