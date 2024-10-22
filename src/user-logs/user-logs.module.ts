import { Module } from '@nestjs/common';
import { UserLogsService } from './user-logs.service';
import { UserLogsController } from './user-logs.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserLogsEntity } from '../users/entities/user-logs.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserLogsEntity]), UsersModule],
  controllers: [UserLogsController],
  providers: [UserLogsService],
  exports: [UserLogsService],
})
export class UserLogsModule {}
