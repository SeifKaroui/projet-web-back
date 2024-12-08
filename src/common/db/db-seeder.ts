import { User, Teacher, Student } from 'src/users/entities/user.entity';
import { Course } from 'src/courses/entities/course.entity';
import { DataSource } from 'typeorm';
import * as argon2 from 'argon2';
import { Homework } from 'src/homework/entities/homework.entity';

export async function seedData(dataSource: DataSource) {
  const teachers = await seedTeachers(dataSource);
  const students = await seedStudents(dataSource);
  const courses = await seedCourses(dataSource, teachers, students);
  await seedHomework(dataSource, courses, teachers);
}

async function seedTeachers(dataSource: DataSource) {
  const teacherRepository = dataSource.getRepository(Teacher);
  
  const teachers = await teacherRepository.save([
    {
      id: '111fcda6-ebfc-4135-a1dd-e1003e608619',
      email: 'prof.smith@university.com',
      firstName: 'John',
      lastName: 'Smith',
      password: await argon2.hash('teacher123'),
      type: 'teacher'
    },
    {
      id: '222fcda6-ebfc-4135-a1dd-e1003e608619',
      email: 'prof.jones@university.com', 
      firstName: 'Sarah',
      lastName: 'Jones',
      password: await argon2.hash('teacher123'),
      type: 'teacher'
    }
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
      type: 'student'
    },
    {
      id: '444fcda6-ebfc-4135-a1dd-e1003e608619',
      email: 'student2@university.com',
      firstName: 'Emma',
      lastName: 'Brown',
      password: await argon2.hash('student123'),
      group: 'A1',
      type: 'student'
    },
    {
      id: '555fcda6-ebfc-4135-a1dd-e1003e608619',
      email: 'student3@university.com',
      firstName: 'James',
      lastName: 'Davis',
      password: await argon2.hash('student123'),
      group: 'B1',
      type: 'student'
    }
  ]);

  return students;
}

async function seedCourses(dataSource: DataSource, teachers: Teacher[], students: Student[]) {
  const courseRepository = dataSource.getRepository(Course);

  const courses = await courseRepository.save([
    {
      title: 'Introduction to Programming',
      description: 'Learn basics of programming with JavaScript',
      type: 'lecture',
      startDate: new Date('2024-03-01'),
      endDate: new Date('2024-06-30'),
      teacher: teachers[0],
      students: [students[0], students[1]]
    },
    {
      title: 'Web Development',
      description: 'Full stack web development with Node.js',
      type: 'tutorial',
      startDate: new Date('2024-03-01'),
      endDate: new Date('2024-06-30'),
      teacher: teachers[1],
      students: [students[1], students[2]]
    },
    {
      title: 'Database Systems',
      description: 'Introduction to SQL and NoSQL databases',
      type: 'lecture',
      startDate: new Date('2024-03-01'),
      endDate: new Date('2024-06-30'),
      teacher: teachers[0],
      students: students
    }
  ]);
  
  return courses;
}

async function seedHomework(dataSource: DataSource, courses: Course[], teachers: Teacher[]) {
  const homeworkRepository = dataSource.getRepository(Homework);

  await homeworkRepository.save([
    {
      description: 'Create a simple JavaScript application',
      deadline: new Date('2024-03-15'),
      teacher: teachers[0],
      course: courses[0],
    },
    {
      description: 'Build a REST API using Express.js',
      deadline: new Date('2024-03-20'),
      teacher: teachers[1],
      course: courses[1],
    },
    {
      description: 'Design and implement a database schema',
      deadline: new Date('2024-03-25'),
      teacher: teachers[0],
      course: courses[2],
    },
    {
      description: 'Create unit tests for your API',
      deadline: new Date('2024-04-01'),
      teacher: teachers[1],
      course: courses[1],
    }
  ]);
}