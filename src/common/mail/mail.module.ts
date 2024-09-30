import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';
import { MailConfigModule } from './config/mail-config.module';

@Module({
  imports: [MailConfigModule],
  controllers: [MailController],
  providers: [MailService],
})
export class MailModule {}
