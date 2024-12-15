import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    OneToOne,
    JoinColumn,
  } from 'typeorm';
  import { Homework } from '../../homework/entities/homework.entity';
  import { Student } from '../../users/entities/user.entity';
  import { Upload } from '../../uploads/entities/upload.entity';
  import { TimeStampEntity } from 'src/common/db/timestamp.entity';

  
  @Entity()
  export class HomeworkSubmission extends TimeStampEntity {
    @PrimaryGeneratedColumn()
    id: number;
  
    @ManyToOne(() => Homework, (homework) => homework.submissions)
    homework: Homework;
  
    @ManyToOne(() => Student, (student) => student.submissions)
    student: Student;
  
    @CreateDateColumn()
    submissionDate: Date;
  
    @Column({ nullable: true })
    grade: number;
  
    @Column({ type: 'text', nullable: true })
    feedback: string;

    @OneToOne(() => Upload, { nullable: false, cascade: true })
    @JoinColumn()
    upload: Upload;
  }