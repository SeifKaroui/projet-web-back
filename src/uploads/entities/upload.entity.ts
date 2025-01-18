import { TimeStampEntity } from 'src/common/db/timestamp.entity';
import { HomeworkSubmission } from 'src/homework-submissions/entities/homework-submission.entity';
import { Post } from 'src/posts/entities/post.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('uploads')
export class Upload extends TimeStampEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  originalname: string;

  @Column()
  filename: string;

  @Column()
  size: number;

  @Column()
  mimetype: string;

  @ManyToOne(() => HomeworkSubmission, (submission) => submission.uploads)
  submission: HomeworkSubmission;

  @ManyToOne(() => Post, (post) => post.attachments)
  post: Post;
}
