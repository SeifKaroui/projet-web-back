import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToMany,
    CreateDateColumn,
  } from 'typeorm';
  import { Teacher } from '../../users/entities/teacher.entity';
  import { Course } from '../../courses/entities/course.entity';
  import { HomeworkSubmission } from '../../homework-submissions/entities/homework-submission.entity';
  
  @Entity()
  export class Homework {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({ type: 'text' })
    description: string;
  
    @Column({ type: 'timestamp' })
    deadline: Date;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @ManyToOne(() => Teacher, (teacher) => teacher.homeworks)
    teacher: Teacher;
  
    @ManyToOne(() => Course, (course) => course.homeworks)
    course: Course;
  
    @OneToMany(() => HomeworkSubmission, (submission) => submission.homework)
    submissions: HomeworkSubmission[];
  }