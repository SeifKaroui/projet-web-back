import { User, Teacher, Student } from 'src/users/entities/user.entity';
import { Course } from 'src/courses/entities/course.entity';
import { Absence } from 'src/absences/entities/absence.entity';
import { DataSource } from 'typeorm';
import * as argon2 from 'argon2';
import { UserType } from 'src/users/enums/user-type.enum';
import { Homework } from 'src/homework/entities/homework.entity';
import { Post } from 'src/posts/entities/post.entity';

export async function seedData(dataSource: DataSource) {
  const teachers = await seedTeachers(dataSource);
  const students = await seedStudents(dataSource);
  const courses = await seedCourses(dataSource, teachers, students);
  await seedHomework(dataSource, courses, teachers);
  await seedAbsences(dataSource, students, courses); // Ajout de l'insertion des absences
  await seedPosts(dataSource);
}

async function seedPosts(dataSource: DataSource) {
  const postsRepository = dataSource.getRepository(Post);
  await postsRepository.save([
    {
      id: 1,
      content: 'Welcome! Get ready to learn JS',
      course: { id: 1 },
    },
    {
      id: 2,
      content: 'Welcome! Get ready to learn node js',
      course: { id: 2 },
    },
    {
      id: 3,
      content: 'Welcome! Get ready to learn databases',
      course: { id: 3 },
    },
    {
      id: 4,
      content: 'SQL queries',
      course: { id: 3 },
    },
  ]);
}

async function seedTeachers(dataSource: DataSource) {
  const teacherRepository = dataSource.getRepository(Teacher);

  const teachers = await teacherRepository.save([
    {
      id: '107fcda6-ebfc-4135-a1dd-e1003e608619',
      email: 'teacher1@email.com',
      firstName: 'teacher1',
      lastName: 'Ben foulen',
      type: UserType.Teacher,
      password: await argon2.hash('password'),
    },
    {
      id: '111fcda6-ebfc-4135-a1dd-e1003e608619',
      email: 'prof.smith@university.com',
      firstName: 'John',
      lastName: 'Smith',
      password: await argon2.hash('teacher123'),
      type: UserType.Teacher,
    },
    {
      id: '222fcda6-ebfc-4135-a1dd-e1003e608619',
      email: 'prof.jones@university.com',
      firstName: 'Sarah',
      lastName: 'Jones',
      password: await argon2.hash('teacher123'),
      type: UserType.Teacher,
    },
    {
      id: '322fcda6-ebfc-4135-a1dd-e1003e608619',
      email: 'stringt',
      firstName: 'Sarah',
      lastName: 'Jones',
      password: await argon2.hash('string'),
      type: UserType.Teacher,
    },
  ]);

  return teachers;
}

async function seedStudents(dataSource: DataSource) {
  const studentRepository = dataSource.getRepository(Student);

  const students = await studentRepository.save([
    {
      id: '333fcda6-ebfc-4135-a1dd-e1003e608619',
      email: 'student1@university.com',
      firstName: 'Mike',
      lastName: 'Wilson',
      password: await argon2.hash('student123'),
      group: 'A1',
      type: UserType.Student,
    },
    {
      id: '444fcda6-ebfc-4135-a1dd-e1003e608619',
      email: 'student2@university.com',
      firstName: 'Emma',
      lastName: 'Brown',
      password: await argon2.hash('student123'),
      group: 'A1',
      type: UserType.Student,
    },
    {
      id: '207fcda6-ebfc-4135-a1dd-e1003e608619',
      email: 'student1@email.com',
      firstName: 'student1',
      lastName: 'Ben foulen',
      type: UserType.Student,
      password: await argon2.hash('password'),
    },
    {
      id: '307fcda6-ebfc-4135-a1dd-e1003e608619',
      email: 'string',
      firstName: 'testFirstname',
      lastName: 'testLastname',
      type: UserType.Teacher,
      password: await argon2.hash('string'),
    },
    {
      id: '555fcda6-ebfc-4135-a1dd-e1003e608619',
      email: 'student3@university.com',
      firstName: 'James',
      lastName: 'Davis',
      password: await argon2.hash('student123'),
      group: 'B1',
      type: UserType.Student,
    },
  ]);

  return students;
}

async function seedCourses(
  dataSource: DataSource,
  teachers: Teacher[],
  students: Student[],
) {
  const courseRepository = dataSource.getRepository(Course);

  const courses = await courseRepository.save([
    {
      id: 1,
      title: 'Introduction to Programming',
      description: 'Learn basics of programming with JavaScript',
      type: 'lecture',
      startDate: new Date('2024-03-01'),
      endDate: new Date('2024-06-30'),
      teacher: teachers[3],
      students: [students[0], students[1]],
    },
    {
      id: 2,
      title: 'Web Development',
      description: 'Full stack web development with Node.js',
      type: 'tutorial',
      startDate: new Date('2024-03-01'),
      endDate: new Date('2024-06-30'),
      teacher: teachers[1],
      students: [students[1], students[2]],
    },
    {
      id: 3,
      title: 'Database Systems',
      description: 'Introduction to SQL and NoSQL databases',
      type: 'lecture',
      startDate: new Date('2024-03-01'),
      endDate: new Date('2024-06-30'),
      teacher: teachers[0],
      students: students,
    },
  ]);

  return courses;
}

async function seedHomework(
  dataSource: DataSource,
  courses: Course[],
  teachers: Teacher[],
) {
  const homeworkRepository = dataSource.getRepository(Homework);

  await homeworkRepository.save([
    {
      id: 1,
      title: 'Homework 1',
      description: 'Create a simple JavaScript application',
      deadline: new Date('2025-03-15'),
      course: courses[0],
    },
    {
      id: 2,
      title: 'Homework 2',
      description: 'Build a REST API using Express.js',
      deadline: new Date('2026-03-20'),
      course: courses[1],
    },
    {
      id: 3,

      title: 'Homework 3',
      description: 'Design and implement a database schema',
      deadline: new Date('2024-03-25'),
      course: courses[2],
    },

    {
      id: 4,
      title: 'Homework 4',
      description: 'Create unit tests for your API',
      deadline: new Date('2027-04-01'),
      course: courses[1],
    },
  ]);
}

async function seedAbsences(
  dataSource: DataSource,
  students: Student[],
  courses: Course[],
) {
  const absenceRepository = dataSource.getRepository(Absence);

  // Simulate multiple absences per student in each course
  await absenceRepository.save([
    // Student 1
    {
      id: 1,
      student: students[0],
      course: courses[0],
      date: new Date('2024-03-05'),
      justified: false,
      justification: null,
    },
    {
      id: 2,
      student: students[0],
      course: courses[0],
      date: new Date('2024-03-12'),
      justified: false,
      justification: null,
    },
    {
      id: 3,
      student: students[0],
      course: courses[0],
      date: new Date('2024-03-18'),
      justified: true, // Justified absence
      justification: null,
    },

    // Student 2
    {
      id: 4,
      student: students[1],
      course: courses[1],
      date: new Date('2024-03-10'),
      justified: true,
      justification: null,
    },
    {
      id: 5,
      student: students[1],
      course: courses[1],
      date: new Date('2024-03-20'),
      justified: false, // Unjustified absence
      justification: null,
    },

    // Student 3
    {
      id: 6,
      student: students[2],
      course: courses[2],
      date: new Date('2024-03-15'),
      justified: false,
      justification: null,
    },
    {
      id: 7,
      student: students[2],
      course: courses[2],
      date: new Date('2024-03-22'),
      justified: true, // Justified absence
      justification: null,
    },
    {
      id: 8,
      student: students[2],
      course: courses[2],
      date: new Date('2024-03-28'),
      justified: false,
      justification: null,
    },

    {
      id: 9,
      student: students[1],
      course: courses[0],
      date: new Date('2024-03-12'),
      justified: false,
      justification: null,
    },
  ]);
}
