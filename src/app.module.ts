import { Module, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { seedData } from './common/db/db-seeder';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { SharedModule } from './shared/shared.module';
import { CoursesModule } from './courses/courses.module';
import { AbsencesModule } from './absences/absences.module';
import { PostModule } from './posts/post.module';
import { CommentsModule } from './comments/comments.module';
import { HomeworkModule } from './homework/homework.module';
import { HomeworkSubmissionsModule } from './homework-submissions/homework-submissions.module';
import { ResultsModule } from './results/results.module';
import { MessagesModule } from './messages/messages.module';
import { UploadsModule } from './uploads/uploads.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService): TypeOrmModuleOptions => ({
        type: configService.get<string>('DB_TYPE') as any,
        host: configService.get<string>('DB_HOST'),
        port: +configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        synchronize: true,
        autoLoadEntities: true,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    SharedModule,
    CoursesModule,
    AbsencesModule,
    PostModule,
    CommentsModule,
    HomeworkModule,
    HomeworkSubmissionsModule,
    ResultsModule,
    MessagesModule,
    UploadsModule,
  ],
})
export class AppModule implements OnModuleInit {
  constructor(private dataSource: DataSource) {}
  async onModuleInit() {
    await seedData(this.dataSource);
  }
}
