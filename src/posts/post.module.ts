import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { Post } from './entities/post.entity';
import { CoursesModule } from 'src/courses/courses.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Post]), CoursesModule, UsersModule],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostModule {}
