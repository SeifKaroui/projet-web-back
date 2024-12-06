import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  TableInheritance,
  ChildEntity,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import  { Comment } from '../../comments/entities/comment.entity';
import  { Message } from '../../messages/entities/message.entity';
import { Course } from 'src/courses/entities/course.entity';
import { Absence } from 'src/absences/entities/absence.entity';
import { HomeworkSubmission } from 'src/homework-submissions/entities/homework-submission.entity';
import { Result } from 'src/results/entities/result.entity';
import { Post } from 'src/posts/entities/post.entity';
import { Homework } from 'src/homework/entities/homework.entity';

@Entity('users')
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;


  @OneToMany(() => Comment, (comment) => comment.author)
  comments: Comment[];

  @OneToMany(() => Message, (message) => message.sender)
  sentMessages: Message[];

  @OneToMany(() => Message, (message) => message.receiver)
  receivedMessages: Message[];
}


@ChildEntity('student')
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

@ChildEntity('teacher')
export class Teacher extends User {
  @OneToMany(() => Course, (course) => course.teacher)
  courses: Course[];

  @OneToMany(() => Post, (post) => post.author)
  posts: Post[];

  @OneToMany(() => Homework, (homework) => homework.teacher)
  homeworks: Homework[];
}