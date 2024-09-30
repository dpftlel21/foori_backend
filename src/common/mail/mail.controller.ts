import { Body, Controller, Post } from '@nestjs/common';
import { MailService } from './mail.service';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  // 1. 메일 전송 API
  @Post('send-verification')
  async sendVerificationEmail(@Body('email') email: string) {
    return this.mailService.sendVerificationEmail(email);
  }
}
