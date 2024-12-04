import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Student } from '../../users/entities/student.entity';
import { Course } from '../../courses/entities/course.entity';

@Entity()
export class Absence {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'timestamp' })
  date: Date;

  @Column()
  justified: boolean;

  @ManyToOne(() => Student, (student) => student.absences)
  student: Student;

  @ManyToOne(() => Course, (course) => course.absences)
  course: Course;
}