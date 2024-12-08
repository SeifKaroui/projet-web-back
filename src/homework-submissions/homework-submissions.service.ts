import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HomeworkSubmission } from './entities/homework-submission.entity';
import { Repository } from 'typeorm';
import { Homework } from '../homework/entities/homework.entity';
import { Student } from '../users/entities/user.entity';
import * as fs from 'fs/promises';

@Injectable()
export class HomeworkSubmissionsService {
  constructor(
    @InjectRepository(HomeworkSubmission)
    private readonly submissionsRepository: Repository<HomeworkSubmission>,
    @InjectRepository(Homework)
    private readonly homeworkRepository: Repository<Homework>,
    @InjectRepository(Student)
    private readonly studentsRepository: Repository<Student>,
  ) {}

  async submitHomework(studentId: string, homeworkId: number, filePath: string) {
    try{
    const homework = await this.homeworkRepository.findOne({
      where: { id: homeworkId },
      relations: ['course'],
    });
    if (!homework) {
      
      throw new NotFoundException('Homework not found');
    }
    if (new Date() > homework.deadline) {
      
      throw new ForbiddenException('Submission deadline has passed');
    }
    const existingSubmission = await this.submissionsRepository.findOne({
      where: {
        homework: { id: homeworkId },
        student: { id: studentId }
      }
    });
    if (existingSubmission) {
      
      throw new ForbiddenException('You have already submitted this homework');
    }

    const student = await this.studentsRepository.findOne({
      where: { id: studentId },
      relations: ['courses'],
    });
    if (!student) {
      
      throw new NotFoundException('Student not found');
    }

    const isEnrolled = student.courses.some(course => course.id === homework.course.id);
    if (!isEnrolled) {
      
      throw new ForbiddenException('You are not enrolled in this course');
    }

    const submission = this.submissionsRepository.create({
      homework,
      student,
      fileUrl: filePath,
    });
    return this.submissionsRepository.save(submission);}
    catch (error) {
      await this.cleanupFile(filePath);
      throw error;
    }
  }
  async deleteSubmission(homeworkId: number, studentId: string) {
    const submission = await this.submissionsRepository.findOne({
      where: { 
        homework: { id: homeworkId },
        student: { id: studentId }
      },
      relations: ['student']
    });
  
    if (!submission) {
      throw new NotFoundException('Submission not found or does not belong to you');
    }
  
    const submissionTime = new Date(submission.submissionDate);
    const timeDiff = Date.now() - submissionTime.getTime();
    const hoursSinceSubmission = timeDiff / (1000 * 60 * 60);
  
    if (hoursSinceSubmission > 1) {
      throw new ForbiddenException('Submissions can only be deleted within 1 hour of submission');
    }
  
   
    try {
      await fs.unlink(submission.fileUrl);
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  
    
    await this.submissionsRepository.remove(submission);
    return { message: 'Submission deleted successfully' };
  }
  
  private async cleanupFile(filePath: string) {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  }
}
