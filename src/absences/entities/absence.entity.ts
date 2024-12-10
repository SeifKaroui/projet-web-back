// src/absences/entities/absence.entity.ts

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, DeleteDateColumn, CreateDateColumn } from 'typeorm';
import { Student } from '../../users/entities/user.entity';
import { Course } from '../../courses/entities/course.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Absence {
  @PrimaryGeneratedColumn()
  id: number;

  // Utilisez @DeleteDateColumn pour gérer la suppression logique
  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deletedAt: Date; // Date de suppression logique (soft delete)

  @ManyToOne(() => Student, student => student.absences)
  student: Student;

  @ManyToOne(() => Course, course => course.absences)
  course: Course;

  @Column()
  date: Date;

  @Column({ default: false })
  justified: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date; 
}
