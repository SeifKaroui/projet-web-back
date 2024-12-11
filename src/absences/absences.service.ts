import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Absence } from './entities/absence.entity';
import { Student } from 'src/users/entities/user.entity';
import { Course } from 'src/courses/entities/course.entity';
import { Repository } from 'typeorm';
import { CreateAbsenceDto } from './dto/create-absence.dto';
import { UpdateAbsenceDto } from './dto/update-absence.dto';
import { DeleteAbsenceDto } from './dto/delete-absence.dto';
import { GetAbsencesByTeacherDto } from './dto/get-absences-by-teacher.dto';
import { CrudService } from 'src/common/generics/crud.service';
import { GetAbsencesByStudentDto } from './dto/get-absences-by-student.dto';

interface GroupedAbsence {
  student: Student;
  absences: { course: Course; date: Date; justified: boolean }[];
}

@Injectable()
export class AbsencesService extends CrudService<Absence> {
  constructor(
    @InjectRepository(Absence)
    private readonly absenceRepository: Repository<Absence>,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
  ) {
    super(absenceRepository);
  }

  async AbsenceCount(studentId: string): Promise<any> {
    const student = await this.studentRepository.findOne({ where: { id: studentId } });
    if (!student) {
      throw new NotFoundException('Student not found');
    }
  
    // Récupérer les absences justifiées et non justifiées pour cet étudiant
    const justifiedCount = await this.absenceRepository.count({
      where: { student, justified: true, deletedAt: null },
    });
  
    const nonJustifiedCount = await this.absenceRepository.count({
      where: { student, justified: false, deletedAt: null },
    });
  
    // Calculer le total des absences
    const totalCount = justifiedCount + nonJustifiedCount;
  
    return {
      justifiedCount,
      nonJustifiedCount,
      totalCount,
    };
  }
  

  async createAbsence(createAbsenceDto: CreateAbsenceDto): Promise<Absence> {
    const { studentId, courseId, date } = createAbsenceDto;

    const student = await this.studentRepository.findOne({ where: { id: studentId } });
    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const course = await this.courseRepository.findOne({ where: { id: courseId } });
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const absence = this.absenceRepository.create({
      student,
      course,
      date,
      justified: false,
    });

    return this.absenceRepository.save(absence);
  }

  async justifyAbsence(id: number, updateAbsenceDto: UpdateAbsenceDto): Promise<Absence> {
    const { justified } = updateAbsenceDto;
    const absence = await this.absenceRepository.findOne({ where: { id } });

    if (!absence) {
      throw new NotFoundException('Absence not found');
    }

    if (absence.deletedAt) {
      throw new ConflictException('Cannot justify a deleted absence');
    }

    if (absence.justified) {
      throw new ConflictException('Absence has already been justified');
    }

    absence.justified = justified;
    return this.absenceRepository.save(absence);
  }

  async getAbsencesForCurrentStudent(
    studentId: string,
    getAbsencesByStudentDto: GetAbsencesByStudentDto
  ): Promise<Absence[]> {
    const { courseId } = getAbsencesByStudentDto;

    const query = this.absenceRepository.createQueryBuilder('absence')
      .leftJoinAndSelect('absence.student', 'student')
      .leftJoinAndSelect('absence.course', 'course')
      .where('absence.deletedAt IS NULL')
      .andWhere('student.id = :studentId', { studentId });

    if (courseId) {
      query.andWhere('course.id = :courseId', { courseId });
    }

    return query.getMany();
  }

  async getAbsenceCountForStudent(
    studentId: string,
    getAbsencesByStudentDto: GetAbsencesByStudentDto
  ): Promise<any> {
    const student = await this.studentRepository.findOne({ where: { id: studentId } });
    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const course = await this.courseRepository.findOne({ where: { id: getAbsencesByStudentDto.courseId } });
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const justifiedCount = await this.absenceRepository.count({
      where: { student, course, justified: true, deletedAt: null },
    });

    const nonJustifiedCount = await this.absenceRepository.count({
      where: { student, course, justified: false, deletedAt: null },
    });

    return {
      justifiedCount,
      nonJustifiedCount,
      totalCount: justifiedCount + nonJustifiedCount,
    };
  }

  async getAbsencesForClassAndTeacher(
    teacherId: string,
    getAbsencesDto: GetAbsencesByTeacherDto
  ): Promise<any> {
    const { courseId } = getAbsencesDto;

    const query = this.absenceRepository.createQueryBuilder('absence')
      .leftJoinAndSelect('absence.student', 'student')
      .leftJoinAndSelect('absence.course', 'course')
      .leftJoinAndSelect('course.teacher', 'teacher')
      .where('absence.deletedAt IS NULL')
      .andWhere('teacher.id = :teacherId', { teacherId });

    if (courseId) {
      query.andWhere('course.id = :courseId', { courseId });
    }

    const absences = await query.getMany();

    const groupedByStudent = absences.reduce((acc, absence) => {
      const studentId = absence.student.id;
      if (!acc[studentId]) {
        acc[studentId] = {
          student: absence.student,
          absences: [],
        };
      }

      acc[studentId].absences.push({
        course: absence.course,
        date: absence.date,
        justified: absence.justified,
      });

      return acc;
    }, {});

    return Object.values(groupedByStudent);
  }

  async getAbsenceCountsByCourseAndTeacher(
    teacherId: string,
    getAbsencesByTeacherDto: GetAbsencesByTeacherDto
  ): Promise<any> {
    const course = await this.courseRepository.findOne({
      where: {
        id: getAbsencesByTeacherDto.courseId,
        teacher: { id: teacherId },
      },
      relations: ['teacher'],
    });

    if (!course) {
      throw new NotFoundException('Course not found or does not belong to the teacher');
    }

    const absences = await this.absenceRepository.createQueryBuilder('absence')
      .leftJoinAndSelect('absence.student', 'student')
      .where('absence.course.id = :courseId', { courseId: getAbsencesByTeacherDto.courseId })
      .andWhere('absence.deletedAt IS NULL')
      .getMany();

    if (absences.length === 0) {
      return [];
    }

    const absenceCounts = absences.reduce((acc, absence) => {
      const studentId = absence.student.id;

      if (!acc[studentId]) {
        acc[studentId] = {
          student: absence.student,
          justifiedCount: 0,
          nonJustifiedCount: 0,
        };
      }

      absence.justified
        ? acc[studentId].justifiedCount++
        : acc[studentId].nonJustifiedCount++;

      return acc;
    }, {});

    return Object.values(absenceCounts);
  }
}
