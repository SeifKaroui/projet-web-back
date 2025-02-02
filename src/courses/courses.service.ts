import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Course } from './entities/course.entity';
import { Student, Teacher, User } from 'src/users/entities/user.entity';
import { MailerService } from '@nestjs-modules/mailer';
import { CreateCourseDto, InvitationType } from './dto/create-course.dto';
import { CrudService } from 'src/common/generics/crud.service';

@Injectable()
export class CoursesService extends CrudService<Course> {
  /**
   * Constructor to inject dependencies
   * @param courseRepository - Repository for Course entity
   * @param mailerService - Service for sending emails
   */
  constructor(
    @InjectRepository(Course)
    public Courserepository: Repository<Course>,
    //private readonly mailerService: MailerService,
  ) {
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
    } else {
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
  async findAllByTeacher(teacher?: Teacher): Promise<Course[]> {
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
  async joinCourseByCode(code: string, student: Student): Promise<{ message: string }> {
    const course = await this.Courserepository.findOne({
      where: {
        courseCode: code,
        deletedAt: IsNull(),
      },
      relations: ['students'],
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Ensure the students array is initialized
    if (!course.students) {
      course.students = [];
    }

    // Check if the student is already enrolled
    if (course.students.some((s) => s.id === student.id)) {
      throw new ConflictException('Already enrolled');
    }

    // Add the student to the course
    course.students.push(student);
    // Save the updated course entity
    await this.Courserepository.save(course);

    // Return a success message
    return { message: 'Successfully joined' };
  }

  /**
   * Check if a user belongs to a course as a student or teacher
   * @param userId - The ID of the user
   * @param courseId - The ID of the course
   * @returns 'student' if the user is a student, 'teacher' if the user is a teacher, or null if the user does not belong to the course
   */
  async checkIfUserBelongsToClass(userId: string, courseId: number): Promise<'student' | 'teacher' | null> {
    const course = await this.Courserepository.findOne({
      where: { id: courseId },
      relations: ['students', 'teacher'], // Load necessary relations
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Check if the user is a student
    const isStudent = course.students?.some((student) => student.id === userId);

    if (isStudent) {
      return 'student';
    }

    // Check if the user is a teacher
    const isTeacher = course.teacher?.id === userId;

    if (isTeacher) {
      return 'teacher';
    }

    return null; // User does not belong to the course
  }

  /**
   * Retrieve the list of students enrolled in a course
   * @param courseId - The ID of the course
   * @param user - The user requesting the list (Teacher or Student)
   * @returns An object containing the students array and count
   */
  async getCourseStudents(courseId: number, user: User) {
    // Vérifiez si l'utilisateur appartient au cours
    const userRole = await this.checkIfUserBelongsToClass(user.id, courseId);
  
    if (userRole === 'teacher' || userRole === 'student') {
      // Récupérez le cours avec les étudiants, indépendamment du rôle de l'utilisateur
      const course = await this.Courserepository.findOne({
        where: {
          id: courseId,
          deletedAt: IsNull(), // Assurez-vous que le cours n'est pas supprimé
        },
        relations: ['students'], // Chargez la relation des étudiants
      });
  
      if (!course) {
        throw new NotFoundException('Course not found');
      }
  
      // Vérifiez les permissions supplémentaires en fonction du rôle
      if (userRole === 'teacher') {
        // Pour les enseignants, assurez-vous que le cours leur appartient
        if (course.teacher.id !== user.id) {
          throw new ForbiddenException('You do not have permission to view this course');
        }
      } else if (userRole === 'student') {
        // Pour les étudiants, assurez-vous qu'ils sont inscrits dans le cours
        const isEnrolled = course.students.some((student) => student.id === user.id);
        if (!isEnrolled) {
          throw new ForbiddenException('You are not enrolled in this course');
        }
      }
  
      // Retournez les étudiants du cours
      return {
        courseId: course.id,
        title: course.title,
        students: course.students.map((student) => ({
          id: student.id,
          firstName: student.firstName,
          lastName: student.lastName,
          email: student.email,
          type: student.type,
        })),
        count: course.students.length,
      };
    } else {
      throw new ForbiddenException('You do not have permission to access this resource');
    }
  }

  /**
   * Find all courses for a specific student
   * @param student - The student
   * @returns An array of courses
   */
  async findStudentCourses(student: Student): Promise<Course[]> {
    const courses = await this.Courserepository
      .createQueryBuilder('course')
      .innerJoin('course.students', 'student')
      .where('student.id = :studentId', { studentId: student.id })
      .andWhere('course.deletedAt IS NULL')
      .leftJoinAndSelect('course.teacher', 'teacher') // Join with the teacher
      .select([
        'course.id',
        'course.title',
        'course.description',
        'course.type',
        'course.startDate',
        'course.courseCode',
        'teacher.createdAt', // Select teacher's createdAt
        'teacher.updatedAt', // Select teacher's updatedAt
        'teacher.id', // Select teacher's ID
        'teacher.firstName', // Select teacher's first name
        'teacher.lastName', // Select teacher's last name
        'teacher.email', // Select teacher's email
        'teacher.type', // Select teacher's type
      ])
      .orderBy('course.startDate', 'DESC')
      .getMany();

    return courses;
  }
}