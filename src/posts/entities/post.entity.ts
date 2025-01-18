import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Course } from '../../courses/entities/course.entity';
import { Comment } from '../../comments/entities/comment.entity';
import { TimeStampEntity } from 'src/common/db/timestamp.entity';
import { Upload } from 'src/uploads/entities/upload.entity';
import { Exclude, Expose } from 'class-transformer';

@Entity('posts')
export class Post extends TimeStampEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  content: string;

  @Exclude()
  @ManyToOne(() => Course, (course) => course.posts)
  course: Course;

  @Expose()
  @OneToMany(() => Upload, (upload) => upload.post, { eager: true })
  attachments: Upload[];

  @Exclude()
  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];
}
