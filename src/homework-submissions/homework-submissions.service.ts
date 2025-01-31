import { Injectable, NotFoundException, ForbiddenException, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HomeworkSubmission } from './entities/homework-submission.entity';
import { Repository } from 'typeorm';
import { Homework } from '../homework/entities/homework.entity';
import { Student } from '../users/entities/user.entity';

import { UpdateHomeworkSubmissionDto } from './dto/update-homework-submission.dto';
import { Course } from 'src/courses/entities/course.entity';
import { UploadsService } from 'src/uploads/uploads.service';
import { Upload } from 'src/uploads/entities/upload.entity';

@Injectable()
export class HomeworkSubmissionsService {
  constructor(
    @InjectRepository(HomeworkSubmission)
    private readonly submissionsRepository: Repository<HomeworkSubmission>,
    @InjectRepository(Homework)
    private readonly homeworkRepository: Repository<Homework>,
    @InjectRepository(Student)
    private readonly studentsRepository: Repository<Student>,
    @InjectRepository(Course)
    private readonly coursesRepository: Repository<Course>,
    private readonly uploadsService: UploadsService,
  ) { }

  async submitHomework(studentId: string, homeworkId: number, files: Express.Multer.File[]) {
    let uploads: Upload[] = null
    try {
      uploads = await this.uploadsService.saveFiles(files);
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
        relations: ['enrolled_courses'],
      });
      if (!student) {

        throw new NotFoundException('Student not found');
      }

      const isEnrolled = student.enrolled_courses.some(course => course.id === homework.course.id);
      if (!isEnrolled) {

        throw new ForbiddenException('You are not enrolled in this course');
      }

      const submission = this.submissionsRepository.create({
        homework,
        student,
        uploads,
      });
      return this.submissionsRepository.save(submission);
    }
    catch (error) {

      if (uploads) {
        uploads.forEach(async upload => {
          await this.uploadsService.deleteUpload(upload);

        });
      }
      throw error;
    }
  }
  async deleteSubmission(homeworkId: number, studentId: string) {
    const submission = await this.submissionsRepository.findOne({
      where: {
        homework: { id: homeworkId },
        student: { id: studentId }
      },
      relations: ['student', 'uploads']
    });

    if (!submission) {
      throw new NotFoundException('Submission not found or does not belong to you');
    }







    try {
      if (submission.uploads && submission.uploads.length > 0) {
        for (const upload of submission.uploads) {
          await this.uploadsService.deleteUpload(upload);
        }
      }
      await this.submissionsRepository.softRemove(submission);
      return { message: 'Submission deleted successfully' };
    } catch (error) {
      throw new InternalServerErrorException('Failed to delete submission');
    }
  }


  async gradeSubmission(submissionId: number, teacherId: string, updateDto: UpdateHomeworkSubmissionDto) {
    const submission = await this.submissionsRepository.findOne({
      where: { id: submissionId },
      relations: ['homework', 'homework.course',  'homework.course.teacher','uploads'],
    });

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    if (submission.homework.course.teacher.id !== teacherId) {
      throw new UnauthorizedException('You are not authorized to grade this submission');
    }

    submission.grade = updateDto.grade;
    submission.feedback = updateDto.feedback;

    return this.submissionsRepository.save(submission);
  }


  async getStudentsSubmissionStatus(homeworkId: number, teacherId: string) {
    const homework = await this.homeworkRepository.findOne({
      where: { id: homeworkId },
      relations: ['course', 'submissions', 'submissions.student', 'submissions.uploads','course.teacher'],
    });

    if (!homework) {
      throw new NotFoundException('Homework not found');
    }

    if (homework.course.teacher.id !== teacherId) {
      throw new UnauthorizedException('You are not authorized to view submissions for this homework');
    }


    const course = await this.coursesRepository.findOne({
      where: { id: homework.course.id },
      relations: ['students'],
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const enrolledStudents = course.students;
    const submissionsMap = new Map<string, HomeworkSubmission>();


    for (const submission of homework.submissions) {
      submissionsMap.set(submission.student.id, submission);
    }


    const response = enrolledStudents.map((student) => {
      const submission = submissionsMap.get(student.id);
      if (submission) {

        return {
          student: {
            id: student.id,
            name: `${student.firstName} ${student.lastName}`,
            email: student.email,
          },
          submission: {
            submissionID: submission.id,
            uploadsIds: submission.uploads?.map(upload => upload.id) ?? [],
            grade: submission.grade !== null ? submission.grade : 'Not graded',
            feedback: submission.feedback !== null ? submission.feedback : 'Not graded',
          },
        };
      } else {

        return {
          student: {
            id: student.id,
            name: `${student.firstName} ${student.lastName}`,
            email: student.email,
          },
          submission: 'Not submitted',
        };
      }
    });

    return response;
  }

}
