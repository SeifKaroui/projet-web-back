import { Entity, Column, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { Course } from '../../courses/entities/course.entity';
import { Absence } from '../../absences/entities/absence.entity';

@Entity()
export class Student extends User {
  @Column()
  group: string;

  @ManyToMany(() => Course, (course) => course.students)
  @JoinTable()
  courses: Course[];

  @OneToMany(() => Absence, (absence) => absence.student)
  absences: Absence[];
}