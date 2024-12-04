import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
  } from 'typeorm';
  import { Homework } from '../../homework/entities/homework.entity';
  import { Student } from '../../users/entities/student.entity';
  
  @Entity()
  export class HomeworkSubmission {
    @PrimaryGeneratedColumn()
    id: number;
  
    @ManyToOne(() => Homework, (homework) => homework.submissions)
    homework: Homework;
  
    @ManyToOne(() => Student, (student) => student.submissions)
    student: Student;
  
    @CreateDateColumn()
    submissionDate: Date;
  
    @Column({ type: 'text' })
    content: string;
  
    @Column({ nullable: true })
    grade: number;
  
    @Column({ type: 'text', nullable: true })
    feedback: string;
  }