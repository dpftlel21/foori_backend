import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  // 인증 이메일 보내기
  async sendVerificationEmail(to: string) {
    const verificationCode = await this.generateVerificationTokenCode();
    await this.verifyTokenCode(verificationCode);

    try {
      await this.mailerService.sendMail({
        to,
        subject: 'Foori 이메일 인증 요청',
        template: './verification',
        context: {
          verificationCode,
        },
      });
      console.log(`Verification code for ${to}: ${verificationCode}`);
    } catch (error) {
      console.error('Failed to send verification email', error);
    }
  }

  async generateVerificationTokenCode(): Promise<string> {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'; // 대문자와 숫자를 포함한 문자열
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length)); // 무작위로 한 글자 선택
    }
    return result;
  }

  async verifyTokenCode(code: string) {
    const regex = /^[A-Z0-9]{6}$/; // 6자리 대문자 또는 숫자로만 구성된지 확인하는 정규표현식

    if (regex.test(code)) {
      console.log('코드가 유효합니다:', code);
    } else {
      console.log('코드가 유효하지 않습니다:', code);
    }
  }
}
