
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, OneToMany } from 'typeorm';
import { Teacher } from '../../users/entities/teacher.entity';
import { Student } from '../../users/entities/student.entity';
import { Absence } from '../../absences/entities/absence.entity';
import { Post } from '../../posts/entities/post.entity';
import { Homework } from '../../homework/entities/homework.entity';
import { Resource } from '../../shared/entities/resource.entity';

@Entity()
export class Course {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  type: string; // e.g., 'lecture', 'tutorial', 'exam'

  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp' })
  endDate: Date;

  @ManyToOne(() => Teacher, (teacher) => teacher.courses)
  teacher: Teacher;

  @ManyToMany(() => Student, (student) => student.courses)
  students: Student[];

  @OneToMany(() => Absence, (absence) => absence.course)
  absences: Absence[];

  @OneToMany(() => Post, (post) => post.course)
  posts: Post[];

  @OneToMany(() => Homework, (homework) => homework.course)
  homeworks: Homework[];

  @OneToMany(() => Resource, (resource) => resource.course)
  resources: Resource[];
}