import { Module, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { seedData } from './common/db/db-seeder';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  DB_DATABASE,
  DB_HOST,
  DB_PASSWORD,
  DB_PORT,
  DB_TYPE,
  DB_USERNAME,
} from './common/db/db.constant';
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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService): any => ({
        type: configService.get(DB_TYPE),
        host: configService.get(DB_HOST),
        port: +configService.get(DB_PORT),
        username: configService.get(DB_USERNAME),
        password: configService.get(DB_PASSWORD),
        database: configService.get(DB_DATABASE),
        synchronize: true,
        // logging: true,
        autoLoadEntities: true,
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    StudentModule,
    SharedModule,
    CoursesModule,
    AbsencesModule,
    PostModule,
    CommentsModule,
    HomeworkModule,
    HomeworkSubmissionsModule,
    ResultsModule,
    MessagesModule,
  ],
})
export class AppModule implements OnModuleInit {
  constructor(private dataSource: DataSource) {}
  async onModuleInit() {
    await seedData(this.dataSource);
  }
}
