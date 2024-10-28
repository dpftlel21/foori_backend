import { Module } from '@nestjs/common';
import { join } from 'path';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: async () => ({
        transport: {
          host: process.env.MAIL_HOST,
          port: process.env.MAIL_PORT,
          secure: process.env.MAIL_SECURE,
          auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASSWORD,
          },
          tls: {
            rejectUnauthorized: false,
          },
        },
        defaults: {
          from: process.env.MAIL_FROM,
        },
        template: {
          dir: join(__dirname, '..', 'templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),
  ],
  controllers: [],
  providers: [],
})
export class MailConfigModule {}
