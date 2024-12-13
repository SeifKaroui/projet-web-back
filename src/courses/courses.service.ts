// Import necessary modules and decorators from NestJS
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
// Import InjectRepository to inject TypeORM repositories
import { InjectRepository } from '@nestjs/typeorm';
// Import TypeORM modules for repository and query operations
import { Repository, IsNull } from 'typeorm';
// Import the Course entity
import { Course } from './entities/course.entity';
// Import Student and Teacher entities
import { Student, Teacher } from 'src/users/entities/user.entity';
// Import MailerService for sending emails
import { MailerService } from '@nestjs-modules/mailer';
// Import CreateCourseDto and InvitationType enum for course creation
import { CreateCourseDto, InvitationType } from './dto/create-course.dto';
// Import the base CrudService
import { CrudService } from 'src/common/generics/crud.service';

// Mark the class as Injectable so it can be provided via dependency injection
@Injectable()
export class CoursesService extends CrudService<Course> {
  /**
   * Constructor to inject dependencies
   * @param courseRepository - Repository for Course entity
   * @param mailerService - Service for sending emails
   */
  constructor(
    // Inject the Course repository
    @InjectRepository(Course)
    // Define the repository  for use in methods
    public Courserepository: Repository<Course>,
    // Inject the MailerService
    private readonly mailerService: MailerService,
  ) {
    // Call the base class constructor with the repository
    super(Courserepository);
  }

  /**
   * Generate a random number within a given range
   * @param min - Minimum number (inclusive)
   * @param max - Maximum number (inclusive)
   * @returns A random number between min and max
   */
  private generateRandomLength(min: number, max: number): number {
    // Math.random() returns a float between 0 and 1
    // Multiply by range and floor it to get an integer
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Generate a random alphanumeric string of a given length
   * @param length - The length of the string to generate
   * @returns A random string of specified length
   */
  private generateRandomString(length: number): string {
    // Define the characters to use
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    // Loop to construct the string
    for (let i = 0; i < length; i++) {
      // Append a random character from chars to result
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Generate a unique course code that doesn't exist in the database
   * @returns A unique course code
   */
  private async generateCourseCode(): Promise<string> {
    // Start with a code length of 6
    let length = 6;
    // Initialize attempt counter
    let attempts = 0;
    // Max attempts before increasing code length
    const maxAttemptsPerLength = 3;

    while (true) {
      // Generate a random code
      const code = this.generateRandomString(length);
      // Check if the code already exists in the database
      const exists = await this.Courserepository.findOne({
        where: {
          courseCode: code,
          deletedAt: IsNull(), // Ensure the course is not soft-deleted
        },
      });
      // If the code doesn't exist, return it
      if (!exists) return code;
      // Increment attempt counter
      attempts++;
      // If max attempts reached, increase the code length
      if (attempts >= maxAttemptsPerLength) {
        // Increase length by 1 or 2 randomly
        length += this.generateRandomLength(1, 2);
        // Reset attempts
        attempts = 0;
      }
    }
  }

  /**
   * Send invitation emails to a list of email addresses
   * @param emails - Array of email addresses
   * @param courseCode - The course code to include in the invitation
   */
  private async sendInvitationEmails(emails: string[], courseCode: string): Promise<void> {
    // Message content for the invitation
    const message = `You've been invited to join a course. Use this code to join: ${courseCode}`;
    // Loop through the list of emails
    for (const email of emails) {
      // Send an email to each recipient
      await this.mailerService.sendMail({
        to: email,
        subject: 'Course Invitation',
        text: message,
      });
    }
  }

  /**
   * Create a new course and handle invitations based on the invitation type
   * @param createCourseDto - Data Transfer Object containing course details
   * @param teacher - The teacher creating the course
   * @returns An object containing the course code or a success message
   */
  async create(createCourseDto: CreateCourseDto, teacher?: Teacher): Promise<any> {
    // Create a new course entity with the provided details and teacher
    const course = this.Courserepository.create({
      ...createCourseDto,
      teacher,
    });
    // Save the new course to the database
    await this.Courserepository.save(course);

    // Generate a unique course code for the course
    const courseCode = await this.generateCourseCode();
    // Update the course with the generated course code
    await this.Courserepository.update(course.id, { courseCode });
    // Update the local course object
    course.courseCode = courseCode;

    // Check the invitation type
    if (createCourseDto.invitationType === InvitationType.CODE) {
      // If invitation is by code, return the course code
      return { courseCode };
    } else if (createCourseDto.invitationType === InvitationType.EMAIL) {
      // If invitation is by email, ensure emails are provided
      if (!createCourseDto.studentEmails || createCourseDto.studentEmails.length === 0) {
        throw new ConflictException('Student emails are required for email invitations');
      }
      // Send invitation emails with the course code
      await this.sendInvitationEmails(createCourseDto.studentEmails, courseCode);
      // Return a success message
      return { message: 'Invitation emails sent successfully' };
    } else {
      // If invitation type is invalid, throw an exception
      throw new ConflictException('Invalid invitation type');
    }
  }

  /**
   * Archive (soft delete) a course
   * @param id - The ID of the course to archive
   * @param teacher - The teacher requesting the archive
   * @returns A success message
   */
  async archive(id: number, teacher?: Teacher): Promise<{ message: string }> {
    // Find the course by ID, teacher ID, and ensure it's not already deleted
    const course = await this.Courserepository.findOne({
      where: {
        id,
        teacher: { id: teacher?.id }, // Ensure the teacher owns the course
        deletedAt: IsNull(),
      },
    });
    // If the course is not found, throw a NotFoundException
    if (!course) {
      throw new NotFoundException('Course not found or you do not have permission to archive it');
    }
    // Soft delete the course
    await this.Courserepository.softDelete(id);
    // Return a success message
    return { message: 'Course archived successfully' };
  }

  /**
   * Find all courses for a specific teacher
   * @param teacherId - The ID of the teacher
   * @returns An array of courses
   */
  async findAllByTeacher(teacher?: Teacher
    ): Promise<Course[]> {
    // Find courses by teacher ID and ensure they're not deleted
    return this.Courserepository.find({
      where: {
        deletedAt: IsNull(),
       teacher: { id: teacher?.id },
      },
      select: ['id', 'title', 'description', 'type', 'startDate', 'courseCode'],
      relations: ['teacher'],
      order: {
        startDate: 'DESC',
      },
    });
  }

  /**
   * Allow a student to join a course using a course code
   * @param code - The course code
   * @param student - The student joining the course
   * @returns A success message
   */
  async joinCourseByCode(code: string, student?: Student): Promise<{ message: string }> {
    // Find the course by course code and ensure it's not deleted
    const course = await this.Courserepository.findOne({
      where: {
        courseCode: code,
        deletedAt: IsNull(),
      },
      relations: ['students'],
    });
    // If the course is not found, throw a NotFoundException
    if (!course) {
      throw new NotFoundException('Course not found');
    }
    // Ensure the students array is initialized
    if (!course.students) {
      course.students = [];
    }
    // Check if the student is already enrolled
    if (student && course.students.some(s => s.id === student.id)) {
      throw new ConflictException('Already enrolled');
    }
    // Add the student to the course
    if (student) {
      course.students.push(student);
      // Save the updated course entity
      await this.Courserepository.save(course);
    }
    // Return a success message
    return { message: 'Successfully joined' };
  }

  /**
   * Retrieve the list of students enrolled in a course
   * @param courseId - The ID of the course
   * @returns An object containing the students array and count
   */
  async getCourseStudents(courseId: number) {
    console.log('Searching for course:', courseId); // Debug log
  
    // First verify course exists
    const courseExists = await this.Courserepository.findOne({
      where: { 
        id: courseId,
        deletedAt: IsNull()
      }
    });
  
    if (!courseExists) {
      throw new NotFoundException('Course not found');
    }
  
    // Then get course with students
    const course = await this.Courserepository
      .createQueryBuilder('course')
      .innerJoinAndSelect('course.students', 'student') 
      .where('course.id = :courseId', { courseId })
      .andWhere('course.deletedAt IS NULL')
      .select([
        'course.id',
        'course.title',
        'student.id',
        'student.firstName',
        'student.lastName',
        'student.email',
        'student.type'
      ])
      .getOne();
  
    // Debug logs
    console.log('Found course:', course);
    console.log('Students:', course?.students);
  
    return {
      courseId, title: course.title,
      students: course?.students || [],
      count: course?.students?.length || 0
    };
  }

  /**
   * Allow a student to join a course via an invitation link (using course ID)
   * @param courseId - The ID of the course
   * @param student - The student joining the course
   * @returns A success message
   */
  async joinCourseByInvitation(courseId: number, student?: Student): Promise<{ message: string }> {
    // Find the course by ID and ensure it's not deleted
    const course = await this.Courserepository.findOne({
      where: {
        id: courseId,
        deletedAt: IsNull(),
      },
      relations: ['students'],
    });
    // If the course is not found, throw a NotFoundException
    if (!course) {
      throw new NotFoundException('Course not found');
    }
    // Ensure the students array is initialized
    if (!course.students) {
      course.students = [];
    }
    // Check if the student is already enrolled
    if (student && course.students.some(s => s.id === student.id)) {
      throw new ConflictException('Already enrolled');
    }
    // Add the student to the course
    if (student) {
      course.students.push(student);
      // Save the updated course entity
      await this.Courserepository.save(course);
    }
    // Return a success message
    return { message: 'Successfully joined' };
  }
  async findStudentCourses(student: Student): Promise<Course[]> {
    return this.Courserepository
      .createQueryBuilder('course')
      .innerJoinAndSelect('course.students', 'student')
      .where('student.id = :studentId', { studentId: student.id })
      .andWhere('course.deletedAt IS NULL')
      .select([
        'course.id',
        'course.title',
        'course.description',
        'course.type',
        'course.startDate',
        'course.courseCode'
      ])
      .orderBy('course.startDate', 'DESC')
      .getMany();
  
  
    }
}