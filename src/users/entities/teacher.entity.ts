import { Entity, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { Course } from '../../courses/entities/course.entity';

@Entity()
export class Teacher extends User {
  @OneToMany(() => Course, (course) => course.teacher)
  courses: Course[];
}