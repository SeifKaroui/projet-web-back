import {
  Get,
  Delete,
  Body,
  Controller,
  Param,
  Post as PostMethod,
  ParseIntPipe,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { Post } from './entities/post.entity';
import { JwtUser } from 'src/auth/interfaces/jwt-user.interface';
import { ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { CustomFilesInterceptor } from 'src/common/interceptors/custom-files.interceptor';

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
  @UseInterceptors(CustomFilesInterceptor)
  @ApiConsumes('multipart/form-data')
  createPostInCourse(
    @GetUser() user: JwtUser,
    @Param('courseId', ParseIntPipe) courseId: number,
    @Body() createUserDto: CreatePostDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ): Promise<Post> {
    console.log('files:');
    console.log(files);
    // return 'eee';
    return this.postsService.createPost(
      user.id,
      courseId,
      createUserDto,
      files,
    );
  }

  @Delete('/posts/:postId')
  remove(
    @GetUser() user: JwtUser,
    @Param('postId', ParseIntPipe) postId: number,
  ) {
    return this.postsService.removePost(user, postId);
  }
}
