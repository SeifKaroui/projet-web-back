import {
  Get,
  Delete,
  Body,
  Controller,
  Param,
  Post as PostMethod,
  ParseIntPipe,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { Post } from './entities/post.entity';
import { JwtUser } from 'src/auth/interfaces/jwt-user.interface';
import { ApiBearerAuth } from '@nestjs/swagger';
import { GetUser } from 'src/common/decorators/get-user.decorator';

@ApiBearerAuth()
@Controller('courses')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get('/:courseId/posts')
  findAllByCourse(
    @GetUser() user: JwtUser,
    @Param('courseId', ParseIntPipe) courseId: number,
  ): Promise<Post[]> {
    return this.postsService.findAllByCourse(user, courseId);
  }

  @Get('/posts/:postId')
  findOneByCourse(
    @GetUser() user: JwtUser,
    @Param('postId') postId: number,
  ): Promise<Post> {
    return this.postsService.findOnePost(user, postId);
  }

  @PostMethod('/:courseId/posts')
  createPostInCourse(
    @GetUser() user: JwtUser,
    @Param('courseId', ParseIntPipe) courseId: number,
    @Body() createUserDto: CreatePostDto,
  ): Promise<Post> {
    return this.postsService.createPost(user.id, courseId, createUserDto);
  }

  @Delete('/posts/:postId')
  remove(
    @GetUser() user: JwtUser,
    @Param('postId', ParseIntPipe) postId: number,
  ) {
    return this.postsService.removePost(user, postId);
  }
}
