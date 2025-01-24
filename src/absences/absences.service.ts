import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
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
import { ValidateAbsenceDto } from './dto/validate-absence.dto';

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

  async checkIfUserBelongsToClass(userId: string, courseId: number): Promise<boolean> {
    // Vérifier si les identifiants sont valides
    if (!userId || !courseId) {
      throw new BadRequestException('Invalid userId or courseId');
    }

    // Rechercher le cours avec les étudiants et l'enseignant associé
    const course = await this.courseRepository.findOne({
      where: { id: courseId },
      relations: ['students', 'teacher'], // Charger la relation 'students' et 'teacher'
    });

    // Vérifier si le cours existe
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Vérifier si l'utilisateur est un étudiant
    const isStudentInCourse = course.students?.some(student => student.id === userId);

    if (isStudentInCourse) {
      return true; // L'utilisateur est un étudiant et appartient au cours
    }

    // Vérifier si l'utilisateur est un enseignant
    if (course.teacher?.id === userId) {
      return true; // L'enseignant est forcément lié au cours
    }

    return false; // L'utilisateur n'appartient ni à ce cours en tant qu'étudiant ni en tant qu'enseignant
  }

  async createAbsence(createAbsenceDto: CreateAbsenceDto, teacherId: string): Promise<Absence> {
    const { studentId, courseId, date } = createAbsenceDto;

    const student = await this.studentRepository.findOne({ where: { id: studentId } });
    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const course = await this.courseRepository.findOne({ where: { id: courseId } });
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Vérifier que l'étudiant appartient au cours avant de créer l'absence
    const isStudentInClass = await this.checkIfUserBelongsToClass(studentId, courseId);
    if (!isStudentInClass) {
      throw new ConflictException('Student is not enrolled in this course');
    }

    // Vérifier que le professeur appartient au cours avant de créer l'absence
    const isTeacherInClass = await this.checkIfUserBelongsToClass(teacherId, courseId);
    if (!isTeacherInClass) {
      throw new ConflictException('Teacher is not enrolled in this course');
    }

    const absence = this.absenceRepository.create({
      student,
      course,
      date,
      justified: false,
      justification: null, // Initialiser la justification à null
    });

    return this.absenceRepository.save(absence);
  }

  async deleteAbsence(teacherId: string, absenceId: number): Promise<void> {
    // Récupérer l'absence avec les relations nécessaires
    const absence = await this.absenceRepository.findOne({
      where: { id: absenceId },
      relations: ['course', 'course.teacher']
    });

    if (!absence) {
      throw new NotFoundException('Absence not found');
    }

    // Vérifier si l'enseignant est responsable du cours lié à l'absence
    const isTeacherInClass = await this.checkIfUserBelongsToClass(teacherId, absence.course.id);
    if (!isTeacherInClass) {
      throw new ConflictException('Teacher is not associated with this course');
    }

    // Soft delete autorisé
    super.softDelete(absenceId);
  }

  async justifyAbsence(studentId: string, id: number, updateAbsenceDto: UpdateAbsenceDto): Promise<Absence> {
    const { justification } = updateAbsenceDto;
    const absence = await this.absenceRepository.findOne({
      where: { id },
      relations: ['course'],
    });
  
    if (!absence) {
      throw new NotFoundException('Absence not found');
    }
  
    // Vérifier que l'étudiant appartient au cours avant de justifier l'absence
    const isUserInClass = await this.checkIfUserBelongsToClass(studentId, absence.course.id);
    if (!isUserInClass) {
      throw new ConflictException('Student is not enrolled in this course');
    }
  
    if (absence.deletedAt) {
      throw new ConflictException('Cannot justify a deleted absence');
    }
  
    if (absence.justification) {
      throw new ConflictException('Absence has already been justified');
    }
  
    absence.justification = justification;
    absence.justified = true;
    return this.absenceRepository.save(absence);
  }

  async validateAbsence(teacherId: string, id: number): Promise<Absence> {
    const absence = await this.absenceRepository.findOne({
      where: { id },
      relations: ['course'],
    });
  
    if (!absence) {
      throw new NotFoundException('Absence not found');
    }
  
    // Vérifier que le professeur appartient au cours
    const isUserInClass = await this.checkIfUserBelongsToClass(teacherId, absence.course.id);
    if (!isUserInClass) {
      throw new ConflictException('Teacher is not enrolled in this course');
    }
  
    if (!absence.justification) {
      throw new ConflictException('Absence has no justification to validate');
    }
  
    absence.confirmed = true; 
    absence.justification = null;
    absence.justified = true; 
  
    return this.absenceRepository.save(absence);
  }
  
  async rejectAbsence(teacherId: string, id: number): Promise<Absence> {
    const absence = await this.absenceRepository.findOne({
      where: { id },
      relations: ['course'],
    });
  
    if (!absence) {
      throw new NotFoundException('Absence not found');
    }
  
    // Vérifier que le professeur appartient au cours
    const isUserInClass = await this.checkIfUserBelongsToClass(teacherId, absence.course.id);
    if (!isUserInClass) {
      throw new ConflictException('Teacher is not enrolled in this course');
    }
  
    if (!absence.justification) {
      throw new ConflictException('Absence has no justification to reject');
    }
  
    absence.confirmed = false; 
    absence.justification = null; 

  
    return this.absenceRepository.save(absence);
  }

  async getAbsencesForCurrentStudent(
    studentId: string,
    getAbsencesByStudentDto: GetAbsencesByStudentDto
  ): Promise<Absence[]> {
    const { courseId } = getAbsencesByStudentDto;

    // Vérification de l'appartenance avant de continuer
    const isUserInClass = await this.checkIfUserBelongsToClass(studentId, courseId);
    if (!isUserInClass) {
      throw new ConflictException('Student is not enrolled in this course');
    }

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
    // Vérifier l'existence de l'étudiant
    const student = await this.studentRepository.findOne({
      where: { id: studentId }
    });
    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // Vérifier l'existence du cours
    const course = await this.courseRepository.findOne({
      where: { id: getAbsencesByStudentDto.courseId }
    });
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Vérification de l'appartenance de l'étudiant au cours
    const isUserInClass = await this.checkIfUserBelongsToClass(studentId, course.id);
    if (!isUserInClass) {
      throw new ConflictException('Student is not enrolled in this course');
    }

    // Compter les absences justifiées
    const justifiedCount = await this.absenceRepository.count({
      where: {
        student: { id: studentId },
        course: { id: course.id },
        justified: true,
        deletedAt: null
      }
    });

    // Compter les absences non justifiées
    const nonJustifiedCount = await this.absenceRepository.count({
      where: {
        student: { id: studentId },
        course: { id: course.id },
        justified: false,
        deletedAt: null
      }
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

    // Vérification de l'appartenance avant de continuer
    const isUserInClass = await this.checkIfUserBelongsToClass(teacherId, courseId);
    if (!isUserInClass) {
      throw new ConflictException('Teacher is not associated with this course');
    }

    // Préparation des options de recherche
    const findOptions: any = {
      where: {
        deletedAt: null,
        course: {
          id: courseId,
          teacher: { id: teacherId }
        }
      },
      relations: ['student', 'course']
    };

    // Récupération des absences
    const absences = await this.absenceRepository.find(findOptions);

    // Regroupement par étudiant
    const groupedByStudent = absences.reduce((acc, absence) => {
      const studentId = absence.student.id;
      if (!acc[studentId]) {
        acc[studentId] = {
          student: absence.student,
          absences: [],
        };
      }

      acc[studentId].absences.push({
        id: absence.id,
        course: absence.course,
        date: absence.date,
        justified: absence.justified,
        justification: absence.justification,
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
      where: { id: getAbsencesByTeacherDto.courseId },
      relations: ['students'], // Charger les étudiants inscrits au cours
    });
  
    if (!course) {
      throw new NotFoundException('Course not found');
    }
  
    // Vérification de l'appartenance avant de continuer
    const isUserInClass = await this.checkIfUserBelongsToClass(teacherId, getAbsencesByTeacherDto.courseId);
    if (!isUserInClass) {
      throw new ConflictException('Teacher is not associated with this course');
    }
  
    // Récupérer tous les étudiants inscrits au cours
    const students = course.students;
  
    // Récupérer les absences pour ce cours
    const absences = await this.absenceRepository.find({
      where: {
        course: { id: course.id },
        deletedAt: null,
      },
      relations: ['student'],
    });
  
    // Créer un map pour stocker les absences par étudiant
    const absenceMap = new Map<string, any>();
    absences.forEach(absence => {
      const studentId = absence.student.id;
      if (!absenceMap.has(studentId)) {
        absenceMap.set(studentId, {
          justifiedCount: 0,
          nonJustifiedCount: 0,
          totalCount: 0,
          absences: [],
        });
      }
      const studentAbsences = absenceMap.get(studentId);
      if (absence.justified) {
        studentAbsences.justifiedCount++;
      } else {
        studentAbsences.nonJustifiedCount++;
      }
      studentAbsences.totalCount++;
      studentAbsences.absences.push({
        date: absence.date,
        justified: absence.justified,
        justification: absence.justification,
      });
    });
  
    // Construire le résultat final en incluant tous les étudiants
    const result = students.map(student => {
      const studentAbsences = absenceMap.get(student.id) || {
        justifiedCount: 0,
        nonJustifiedCount: 0,
        totalCount: 0,
        absences: [],
      };
      return {
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        absenceCounts: {
          justifiedCount: studentAbsences.justifiedCount,
          nonJustifiedCount: studentAbsences.nonJustifiedCount,
          totalCount: studentAbsences.totalCount,
        },
        absences: studentAbsences.absences,
      };
    });
  
    return result;
  }
}