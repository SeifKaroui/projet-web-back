import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Teacher } from '../../users/entities/user.entity';
import { Course } from '../../courses/entities/course.entity';
import { Comment } from '../../comments/entities/comment.entity';
import { TimeStampEntity } from 'src/common/db/timestamp.entity';

@Entity()
export class Post extends TimeStampEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  content: string;

  @ManyToOne(() => Teacher, (teacher) => teacher.posts)
  author: Teacher;

  @ManyToOne(() => Course, (course) => course.posts)
  course: Course;

  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];
}

