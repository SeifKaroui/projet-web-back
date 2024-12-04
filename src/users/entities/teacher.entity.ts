import { ChildEntity, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { Course } from '../../courses/entities/course.entity';
import { Post } from '../../posts/entities/post.entity';
import { Homework } from '../../homework/entities/homework.entity';

@ChildEntity()
export class Teacher extends User {
  @OneToMany(() => Course, (course) => course.teacher)
  courses: Course[];

  @OneToMany(() => Post, (post) => post.author)
  posts: Post[];

  @OneToMany(() => Homework, (homework) => homework.teacher)
  homeworks: Homework[];
}