import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';
import { MailConfigModule } from './config/mail-config.module';
import { CacheModule } from '../cache/cache.module';

@Module({
  imports: [MailConfigModule, CacheModule],
  controllers: [MailController],
  providers: [MailService],
})
export class MailModule {}
