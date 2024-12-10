
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, OneToMany } from 'typeorm';
import { Teacher } from '../../users/entities/user.entity';
import { Student } from '../../users/entities/user.entity';
import { Absence } from '../../absences/entities/absence.entity';
import { Post } from '../../posts/entities/post.entity';
import { Homework } from '../../homework/entities/homework.entity';
import { Result } from '../../results/entities/result.entity';
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
  @OneToMany(() => Result, (result) => result.course)
  results: Result[];

}