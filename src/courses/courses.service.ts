import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial, IsNull } from 'typeorm';
import { Course } from './entities/course.entity';
import { BaseCrudService } from './common/base-crud.service';
import { MailerService } from '@nestjs-modules/mailer';
import { CreateCourseDto, InvitationType } from './dto/create-course.dto';
import { Student, Teacher } from 'src/users/entities/user.entity';
@Injectable()
export class CoursesService extends BaseCrudService<Course> {
  constructor(
    @InjectRepository(Course)
    courseRepository: Repository<Course>,
    private readonly mailerService: MailerService,
  ) {
    super(courseRepository);
  }

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
    let length = 6;
    let attempts = 0;
    const maxAttemptsPerLength = 3;

    while (true) {
      const code = this.generateRandomString(length);
      const exists = await this.findOne({
        where: { 
          courseCode: code,
          deletedAt: IsNull()
        }
      }).catch(() => null);
      
      if (!exists) return code;

      attempts++;
      if (attempts >= maxAttemptsPerLength) {
        length += this.generateRandomLength(1, 2);
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

  async create(createCourseDto: CreateCourseDto, teacher?: Teacher): Promise<any> {
    const course = await super.create({
      ...createCourseDto,
      teacher,
    });

    if (createCourseDto.invitationType === InvitationType.CODE) {
      const courseCode = await this.generateCourseCode();
      await super.update(course.id, { courseCode });
      return { courseCode };
    } else {
      await this.sendInvitationEmails(createCourseDto.studentEmails, course.id);
      return { message: 'Invitation emails sent successfully' };
    }
  }

  async archive(id: number, teacher?: Teacher): Promise<{ message: string }> {
    await this.findOne({
      where: { 
        id,
        teacher: { id: teacher?.id } as any,
        deletedAt: IsNull()
      }
    });

    await super.softDelete(id);
    return { message: 'Course archived successfully' };
  }

  async findAllByTeacher(teacherId?: number): Promise<Course[]> {
    return super.findAll({
      where: {
        deletedAt: IsNull(),
        ...(teacherId && { teacher: { id: teacherId } as any })
      },
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        startDate: true,
        courseCode: true,
      },
      order: { startDate: 'DESC' }
    });
  }

  async joinCourseByCode(code: string, student?: Student): Promise<{ message: string }> {
    const course = await this.findOne({
      where: { 
        courseCode: code,
        deletedAt: IsNull()
      },
      relations: ['students']
    });

    if (student && course.students.some(s => s.id === student.id)) {
      throw new ConflictException('Already enrolled');
    }

    if (student) {
      course.students = [...course.students, student];
      await super.create(course);
    }

    return { message: 'Successfully joined' };
  }
//return the students of a course
  async getCourseStudents(courseId: number): Promise<{ students: Student[], count: number }> {
    const course = await this.findOne({
      where: { 
        id: courseId,
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

  async joinCourseByInvitation(courseId: number, student?: Student): Promise<{ message: string }> {
    const course = await this.findOne({
      where: { 
        id: courseId,
        deletedAt: IsNull()
      },
      relations: ['students']
    });

    if (student && course.students.some(s => s.id === student.id)) {
      throw new ConflictException('Already enrolled');
    }

    if (student) {
      course.students = [...course.students, student];
      await this.repository.save(course);
    }

    return { message: 'Successfully joined' };
  }
}