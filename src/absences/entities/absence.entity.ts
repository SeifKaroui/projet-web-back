import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  ManyToOne, 
  DeleteDateColumn, 
  CreateDateColumn 
} from 'typeorm';
import { Student } from '../../users/entities/user.entity';
import { Course } from '../../courses/entities/course.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Absence {
  @PrimaryGeneratedColumn()
  id: number;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deletedAt: Date; 

  @ManyToOne(() => Student, (student) => student.absences)
  student: Student;

  @ManyToOne(() => Course, (course) => course.absences)
  course: Course;

  @Column()
  date: Date;

  @Column({ default: false })
  justified: boolean;

  @Column({ type: 'text', nullable: true })
  justification: string; 
  
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}
