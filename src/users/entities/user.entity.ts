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
import { Comment } from '../../comments/entities/comment.entity';
import { Message } from '../../messages/entities/message.entity';
import { Course } from 'src/courses/entities/course.entity';
import { Absence } from 'src/absences/entities/absence.entity';
import { HomeworkSubmission } from 'src/homework-submissions/entities/homework-submission.entity';
import { Post } from 'src/posts/entities/post.entity';
import { UserType } from '../enums/user-type.enum';
import { TimeStampEntity } from 'src/common/db/timestamp.entity';
import { Exclude } from 'class-transformer';
import { ApiHideProperty } from '@nestjs/swagger';
import { Homework } from 'src/homework/entities/homework.entity';
import { Result } from 'src/courses/entities/result.entity';

@Entity('users')
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export class User extends TimeStampEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Exclude()
  @Column()
  password: string;

  @Column({ type: 'enum', enum: UserType })
  type: UserType;

  @ApiHideProperty()
  @OneToMany(() => Comment, (comment) => comment.author)
  comments: Comment[];

  @ApiHideProperty()
  @OneToMany(() => Message, (message) => message.sender)
  sentMessages: Message[];

  @ApiHideProperty()
  @OneToMany(() => Message, (message) => message.receiver)
  receivedMessages: Message[];
}

@ChildEntity(UserType.Student)
export class Student extends User {
  @ManyToMany(() => Course, (course) => course.students)
  @JoinTable({ name: 'user_enrolled_courses' })
  enrolled_courses: Course[];

  @OneToMany(() => Absence, (absence) => absence.student)
  absences: Absence[];

  @OneToMany(() => HomeworkSubmission, (submission) => submission.student)
  submissions: HomeworkSubmission[];

  @OneToMany(() => Result, (result) => result.student)
  results: Result[];
}

@ChildEntity(UserType.Teacher)
export class Teacher extends User {
  @OneToMany(() => Course, (course) => course.teacher)
  courses: Course[];

  @OneToMany(() => Homework, (homework) => homework.teacher)
  homeworks: Homework[];
}
