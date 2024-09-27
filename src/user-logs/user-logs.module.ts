import { Module } from '@nestjs/common';
import { UserLogsService } from './user-logs.service';
import { UserLogsController } from './user-logs.controller';

@Module({
  controllers: [UserLogsController],
  providers: [UserLogsService],
})
export class UserLogsModule {}
