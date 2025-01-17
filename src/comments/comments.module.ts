import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { Post } from '../posts/entities/post.entity';
import { User } from '../users/entities/user.entity';
import { CommentService } from './comments.service';
import { CommentController } from './comments.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Comment, Post, User])],
  providers: [CommentService],
  controllers: [CommentController],
})
export class CommentsModule { }
