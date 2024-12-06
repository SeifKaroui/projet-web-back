import { DataSource, DataSourceOptions } from 'typeorm';
import { Course } from './courses/entities/course.entity';
import { Post } from './posts/entities/post.entity';
import { Teacher, Student } from './users/entities/user.entity';
import { Absence } from './absences/entities/absence.entity';
import { Comment } from './comments/entities/comment.entity';
import { Homework } from './homework/entities/homework.entity';
import { HomeworkSubmission } from './homework-submissions/entities/homework-submission.entity';
import { Result } from './results/entities/result.entity';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

@Injectable()
class DatabaseConfigService {
  constructor(private configService: ConfigService) {}

  getDataSourceOptions() {
    return <DataSourceOptions>{
      type: this.configService.get<string>('DB_TYPE'),
      host: this.configService.get<string>('DB_HOST'),
      port: +this.configService.get<number>('DB_PORT'),
      username: this.configService.get<string>('DB_USERNAME'),
      password: this.configService.get<string>('DB_PASSWORD'),
      database: this.configService.get<string>('DB_DATABASE'),
      synchronize: true,
      region: this.configService.get<string>('DB_REGION'),
      secretArn: this.configService.get<string>('DB_SECRET_ARN'),
      resourceArn: this.configService.get<string>('DB_RESOURCE_ARN'),
      entities: [
        Course,
        Post,
        Teacher,
        Student,
        Absence,
        Comment,
        Homework,
        HomeworkSubmission,
        Result,
      ],
    };
  }
}

const configService = new ConfigService();
const databaseConfigService = new DatabaseConfigService(configService);

export const AppDataSource = new DataSource(databaseConfigService.getDataSourceOptions());