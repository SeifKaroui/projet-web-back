import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Student } from '../../users/entities/user.entity';
import { Course } from '../../courses/entities/course.entity';

@Entity()
export class Result {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Student, (student) => student.results)
  student: Student;

  @ManyToOne(() => Course, (course) => course.results)
  course: Course;

  @Column()
  evaluationType: string; // e.g., 'exam', 'project'

  @Column('float')
  grade: number;
}