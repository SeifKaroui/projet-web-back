import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository ,IsNull } from 'typeorm';
import { Course } from './entities/course.entity';
import { CreateCourseDto, InvitationType } from './dto/create-course.dto';
import { Student, Teacher } from '../users/entities/user.entity';
import { MailerService } from '@nestjs-modules/mailer';



@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    private readonly mailerService: MailerService,
  ) {}
  private generateRandomLength(min: number, max: number): number {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

  private generateRandomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private async generateCourseCode(): Promise<string> {
    let length = 6; // Start with length 6
    let attempts = 0;
    const maxAttemptsPerLength = 3;

    while (true) {
      const code = this.generateRandomString(length);
      const exists = await this.courseRepository.findOne({
        where: { courseCode: code ,
                  deletedAt: IsNull() //check only non-archive classroom 
        }
      });
      
      if (!exists) {
        return code;
      }

      attempts++;
      
      // After 3 attempts at current length, increase length randomly
      if (attempts >= maxAttemptsPerLength) {
        length += this.generateRandomLength(1, 2); // Increment by 1 or 2
        attempts = 0;
      }
    }
  }

  private async sendInvitationEmails(emails: string[], courseId: number): Promise<void> {
    const invitationLink = `http://yourdomain.com/courses/${courseId}/join`;
    
    for (const email of emails) {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Course Invitation',
        text: `You've been invited to join a course. Click here to join: ${invitationLink}`,
      });
    }
  }

  async create(createCourseDto: CreateCourseDto, teacher: Teacher): Promise<any> {
    const course = this.courseRepository.create({
      ...createCourseDto,
      teacher,
    });

    const savedCourse = await this.courseRepository.save(course);

    if (createCourseDto.invitationType === InvitationType.CODE) {
      const courseCode = await this.generateCourseCode();
      await this.courseRepository.update(savedCourse.id, { courseCode });
      return { courseCode };
    } else {
      await this.sendInvitationEmails(createCourseDto.studentEmails, savedCourse.id);
      return { message: 'Invitation emails sent successfully' };
    }
  }
  async archive(id: number, teacher: Teacher
    ): Promise<{ message: string }> {
    const course = await this.courseRepository.findOne({
      where: { 
        id,
        teacher: teacher,
        deletedAt: IsNull()
      }
    });
  
    if (!course) {
      throw new NotFoundException('Course not found');
    }
  
    if (course.teacher.id !== teacher.id) {
      throw new ForbiddenException('You can only archive your own courses');
    }
  
    await this.courseRepository.softDelete(id);
    
    return { message: 'Course archived successfully' };
  }
  async findAllByTeacher(teacherId?: number): Promise<Course[]> {
    return this.courseRepository.find({
      where: {
        deletedAt: IsNull(),
        ...(teacherId && { teacherId }), // Use teacherId directly
      },
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        startDate: true,
        courseCode: true,
      },
      order: {
        startDate: 'DESC',
      },
    });
  }
  async findAll(): Promise<Course[]> {
    return this.courseRepository.find({
      where: {
        deletedAt: IsNull(),
      },
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        startDate: true,
        courseCode: true,
      },
      order: {
        startDate: 'DESC',
      },
    });
  }
  async joinCourseByCode(code: string, student: Student): Promise<{ message: string }> {
    const course = await this.courseRepository.findOne({
      where: { 
        courseCode: code,
        deletedAt: IsNull()
      },
      relations: ['students']
    });

    if (!course) {
      throw new NotFoundException('Course not found with this code');
    }

    // Check if student already joined
    if (course.students.some(s => s.id === student.id)) {
      throw new ConflictException('Already enrolled in this course');
    }

    course.students = [...course.students, student];
    await this.courseRepository.save(course);
    
    return { message: 'Successfully joined the course' };
  }
  async getCourseStudents(courseId: number,  teacher: Teacher
    ): Promise<{ students: Student[], count: number }> {
    const course = await this.courseRepository.findOne({
      where: { 
        id: courseId,
        teacher: { id: teacher.id },
        deletedAt: IsNull()
      },
      relations: ['students']
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return {
      students: course.students,
      count: course.students.length
    };
  }
  async joinCourseByInvitation(courseId: number, student: Student): Promise<{ message: string }> {
    const course = await this.courseRepository.findOne({
      where: { 
        id: courseId,
        deletedAt: IsNull()
      },
      relations: ['students']
    });
  
    if (!course) {
      throw new NotFoundException('Course not found');
    }
  
    if (course.students.some(s => s.id === student.id)) {
      throw new ConflictException('Already enrolled in this course');
    }
  
    course.students = [...course.students, student];
    await this.courseRepository.save(course);
    
    return { message: 'Successfully joined the course' };
  }
}
  



