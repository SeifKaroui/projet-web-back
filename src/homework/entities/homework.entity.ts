import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { Teacher } from '../../users/entities/user.entity';
import { Course } from '../../courses/entities/course.entity';
import { HomeworkSubmission } from '../../homework-submissions/entities/homework-submission.entity';
import { TimeStampEntity } from 'src/common/db/timestamp.entity';

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

  @ManyToOne(() => Teacher, (teacher) => teacher.homeworks)
  teacher: Teacher;

  @ManyToOne(() => Course, (course) => course.homeworks)
  course: Course;

  @OneToMany(() => HomeworkSubmission, (submission) => submission.homework)
  submissions: HomeworkSubmission[];
}