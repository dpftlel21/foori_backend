import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { CrawlModule } from './common/crawl/crawl.module';
import { PlaceModule } from './place/place.module';
import { ReviewsModule } from './reviews/reviews.module';
import { BookingModule } from './booking/booking.module';
import { BookingMenusModule } from './booking-menus/booking-menus.module';
import { MenusModule } from './menus/menus.module';
import { LikesModule } from './common/likes/likes.module';
import { FavoritesModule } from './common/favorites/favorites.module';
import { UserLogsModule } from './user-logs/user-logs.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { PugAdapter } from '@nestjs-modules/mailer/dist/adapters/pug.adapter';
import { MailModule } from './common/mail/mail.module';

@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: () => ({
        transport: 'smtps://user@domain.com:pass@smtp.domain.com',
        defaults: {
          from: '"nest-modules" <modules@nestjs.com>',
        },
        template: {
          dir: __dirname + '/templates',
          adapter: new PugAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      envFilePath: `.${process.env.NODE_ENV}.env`,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_SCHEMA,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // Don't use this in production
      logging: true,
      charset: 'utf8mb4_unicode_ci', // 한글 인코딩
      timezone: '+09:00', // 한국 시간
    }),
    UsersModule,
    AuthModule,
    CrawlModule,
    PlaceModule,
    ReviewsModule,
    BookingModule,
    BookingMenusModule,
    MenusModule,
    LikesModule,
    FavoritesModule,
    UserLogsModule,
    MailModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
  ],
})
export class AppModule {}
