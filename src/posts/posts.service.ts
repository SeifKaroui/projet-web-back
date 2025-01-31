import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CrudService } from 'src/common/generics/crud.service';
import { Post } from './entities/post.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { Course } from 'src/courses/entities/course.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { JwtUser } from 'src/auth/interfaces/jwt-user.interface';
import { UserType } from 'src/users/enums/user-type.enum';
import { UploadsService } from 'src/uploads/uploads.service';

@Injectable()
export class PostsService extends CrudService<Post> {
  constructor(
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,

    @InjectRepository(Course)
    private readonly coursesRepository: Repository<Course>,

    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    private uploadsService: UploadsService,
  ) {
    super(postsRepository);
  }

  async findOnePost(user: JwtUser, postId: number): Promise<Post> {
    const post = await this.postsRepository.findOne({
      where: { id: postId },
      relations: ['course'],
    });
    if (!post) {
      throw new NotFoundException(`Course with id: ${postId} not found.`);
    }
    const courseId = post.course.id;
    const course = await this.coursesRepository.findOne({
      where: { id: courseId },
      relations: ['teacher'],
    });
    if (!course) {
      throw new NotFoundException(`Course with id: ${courseId} not found.`);
    }
    if (user.type == UserType.Teacher) {
      if (course.teacher.id != user.id) {
        throw new UnauthorizedException(`Cannot view post.`);
      }
      return post;
    }
    if (!(await this.isUserEnrolledInCourse(user.id, courseId))) {
      throw new UnauthorizedException(`Cannot view post.`);
    }
    return post;
  }

  async findAllByCourse(user: JwtUser, courseId: number): Promise<Post[]> {
    const canViewCoursePosts: boolean = await this.canViewCoursePosts(
      user,
      courseId,
    );
    if (!canViewCoursePosts) {
      throw new UnauthorizedException(`Cannot view posts in this course.`);
    }
    return this.postsRepository.findBy({
      course: { id: courseId },
    });
  }

  private async canCreatePost(
    userId: string,
    courseId: number,
  ): Promise<boolean> {
    const course = await this.coursesRepository.findOne({
      where: { id: courseId },
      relations: ['teacher'],
    });

    if (!course) {
      throw new NotFoundException(`Course with id: ${courseId} not found.`);
    }

    return course.teacher.id == userId;
  }

  async createPost(
    userId: string,
    courseId: number,
    createPostDto: CreatePostDto,
    files: Array<Express.Multer.File>,
  ): Promise<Post> {
    const canCreatePost: boolean = await this.canCreatePost(userId, courseId);
    if (!canCreatePost) {
      throw new UnauthorizedException(`Cannot create a post in this course.`);
    }

    const attachments = await this.uploadsService.saveFiles(files);

    const post = this.postsRepository.create({
      ...createPostDto,
      course: { id: courseId },
      attachments,
    });

    return this.postsRepository.save(post);
  }

  private async canViewCoursePosts(
    user: JwtUser,
    courseId: number,
  ): Promise<boolean> {
    const course = await this.coursesRepository.findOne({
      where: { id: courseId },
      relations: ['teacher'],
    });
    if (!course) {
      throw new NotFoundException(`Course with id: ${courseId} not found.`);
    }
    if (course.teacher.id == user.id) {
      return true;
    }
    return this.isUserEnrolledInCourse(user.id, courseId);
  }
  private async canDeletePost(user: JwtUser, postId: number): Promise<boolean> {
    const post = await this.postsRepository.findOne({
      where: { id: postId },
      relations: ['course'],
    });
    if (!post) {
      throw new NotFoundException(`Course with id: ${postId} not found.`);
    }
    const courseId = post.course.id;
    const course = await this.coursesRepository.findOne({
      where: { id: courseId },
      relations: ['teacher'],
    });
    if (!course) {
      throw new NotFoundException(`Course with id: ${courseId} not found.`);
    }
    if (user.type == UserType.Teacher && course.teacher.id == user.id) {
      return true;
    }
    return false;
  }
  async removePost(user: JwtUser, postId: number) {
    const canDeletePost: boolean = await this.canDeletePost(user, postId);
    if (!canDeletePost) {
      throw new UnauthorizedException(`Cannot delete post with id: ${postId}.`);
    }
    return super.softDelete(postId);
  }

  private async isUserEnrolledInCourse(
    userId: string,
    courseId: number,
  ): Promise<boolean> {
    const userEnrolledInCourse = await this.usersRepository
      .createQueryBuilder()
      .select('user_enrolled_courses.*')
      .from('user_enrolled_courses', 'user_enrolled_courses')
      .andWhere('user_enrolled_courses.usersId = :userId', { userId })
      .andWhere('user_enrolled_courses.courseId = :courseId', { courseId })
      .getRawOne();

    if (!userEnrolledInCourse) {
      return false;
    }

    return true;
  }
}
