import {
  ChildEntity,
  Column,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { Course } from '../../courses/entities/course.entity';
import { Absence } from '../../absences/entities/absence.entity';
import { HomeworkSubmission } from '../../homework-submissions/entities/homework-submission.entity';
import { Result } from '../../results/entities/result.entity';

@ChildEntity()
export class Student extends User {
  @Column()
  group: string;

  @ManyToMany(() => Course, (course) => course.students)
  @JoinTable()
  courses: Course[];

  @OneToMany(() => Absence, (absence) => absence.student)
  absences: Absence[];

  @OneToMany(() => HomeworkSubmission, (submission) => submission.student)
  submissions: HomeworkSubmission[];

  @OneToMany(() => Result, (result) => result.student)
  results: Result[];
}