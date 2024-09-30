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

  @Post('verify-code')
  async verifyCode(@Body('email') email: string, @Body('code') code: string) {
    const result = await this.mailService.verifyCode(email, code);

    if (result === 1) {
      return { message: `Verification successful: ${email} / ${code}` };
    } else {
      return {
        message: `Invalid or expired verification code: ${email} / ${code}`,
      };
    }
  }
}
