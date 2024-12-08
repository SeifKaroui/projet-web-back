// absences.service.ts
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Absence } from './entities/absence.entity';
import { Student } from 'src/users/entities/user.entity';
import { Course } from 'src/courses/entities/course.entity';
import { Repository } from 'typeorm';
import { CreateAbsenceDto } from './dto/create-absence.dto';
import { UpdateAbsenceDto } from './dto/update-absence.dto';
import { DeleteAbsenceDto } from './dto/delete-absence.dto';
import { GetAbsencesDto } from './dto/get-absences.dto';

@Injectable()
export class AbsencesService {
  constructor(
    @InjectRepository(Absence)
    private readonly absenceRepository: Repository<Absence>,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
  ) {}

  async updateAbsenceCount(studentId: string): Promise<number> {
    const student = await this.studentRepository.findOne({ where: { id: studentId } });
    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const count = await this.absenceRepository.count({
      where: {
        student: student,
        justified: false,
      },
    });

    return count;
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

    if (absence.justified) {
      throw new ConflictException('Absence has already been justified');
    }

    absence.justified = justified;
    return this.absenceRepository.save(absence);
  }

  async deleteAbsence(deleteAbsenceDto: DeleteAbsenceDto): Promise<void> {
    const { absenceId } = deleteAbsenceDto;
    const result = await this.absenceRepository.delete(absenceId);

    if (result.affected === 0) {
      throw new NotFoundException('Absence not found');
    }
  }

  async getAbsences(getAbsencesDto: GetAbsencesDto): Promise<Absence[]> {
    const { studentId, courseId, startDate, endDate } = getAbsencesDto;

    const query = this.absenceRepository.createQueryBuilder('absence')
      .leftJoinAndSelect('absence.student', 'student')
      .leftJoinAndSelect('absence.course', 'course');

    if (studentId) {
      query.andWhere('student.id = :studentId', { studentId });
    }

    if (courseId) {
      query.andWhere('course.id = :courseId', { courseId });
    }

    if (startDate && endDate) {
      query.andWhere('absence.date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    return query.getMany();
  }
}
