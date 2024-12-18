import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  Unique,
} from 'typeorm';
import { Teacher } from '../../users/entities/user.entity';
import { Course } from '../../courses/entities/course.entity';
import { HomeworkSubmission } from '../../homework-submissions/entities/homework-submission.entity';
import { TimeStampEntity } from 'src/common/db/timestamp.entity';
import { Upload } from 'src/uploads/entities/upload.entity';

@Entity()
export class Homework extends TimeStampEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'timestamp' })
  deadline: Date;

  @ManyToOne(() => Course, (course) => course.homeworks)
  course: Course;

  @ManyToOne(() => Teacher, (teacher) => teacher.homeworks)
  teacher: Teacher;

  @OneToMany(() => HomeworkSubmission, (submission) => submission.homework)
  submissions: HomeworkSubmission[];

  @OneToMany(()=> Upload,"" )
  files: Upload[];
}