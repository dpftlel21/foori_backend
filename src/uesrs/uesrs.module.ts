import { Module } from '@nestjs/common';
import { UesrsService } from './uesrs.service';
import { UesrsController } from './uesrs.controller';

@Module({
  controllers: [UesrsController],
  providers: [UesrsService],
})
export class UesrsModule {}
