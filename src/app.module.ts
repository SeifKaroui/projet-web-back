import { Module, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { seedData } from './common/db/db-seeder';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CoursesModule } from './courses/courses.module';
import { AbsencesModule } from './absences/absences.module';
import { PostModule } from './posts/post.module';
import { CommentsModule } from './comments/comments.module';
import { HomeworkModule } from './homework/homework.module';
import { HomeworkSubmissionsModule } from './homework-submissions/homework-submissions.module';

import { APP_GUARD } from '@nestjs/core';
import { AccessTokenGuard } from './common/guards/accessToken.guard';

import { MailerModule } from '@nestjs-modules/mailer';

import { UploadsModule } from './uploads/uploads.module';
import { DB_DATABASE, DB_HOST, DB_PASSWORD, DB_PORT, DB_TYPE, DB_USERNAME } from './common/db/db.constant';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService): TypeOrmModuleOptions => ({
        type: configService.get<string>(DB_TYPE) as any,
        host: configService.get<string>(DB_HOST),
        port: +configService.get<number>(DB_PORT),
        username: configService.get<string>(DB_USERNAME),
        password: configService.get<string>(DB_PASSWORD),
        database: configService.get<string>(DB_DATABASE),
        synchronize: true,
        autoLoadEntities: true,
      }),
      inject: [ConfigService],
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get('SMTP_HOST'),
          port: configService.get('SMTP_PORT'),
          auth: {
            user: configService.get('SMTP_USER'),
            pass: configService.get('SMTP_PASSWORD'),
          },
        },
        defaults: {
          from: configService.get('SMTP_FROM'),
        },
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    CoursesModule,
    AbsencesModule,
    PostModule,
    CommentsModule,
    HomeworkModule,
    HomeworkSubmissionsModule,
    UploadsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AccessTokenGuard,
    },
  ],
})
export class AppModule implements OnModuleInit {
  constructor(private dataSource: DataSource) {}
  async onModuleInit() {
    await seedData(this.dataSource);
  }
}
