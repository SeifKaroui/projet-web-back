import { User, Teacher, Student } from 'src/users/entities/user.entity';
import { Course } from 'src/courses/entities/course.entity';
import { Absence } from 'src/absences/entities/absence.entity';
import { DataSource } from 'typeorm';
import * as argon2 from 'argon2';
import { UserType } from 'src/users/enums/user-type.enum';
import { Homework } from 'src/homework/entities/homework.entity';
import { Post } from 'src/posts/entities/post.entity';
import { v4 as uuidv4 } from 'uuid'; // Pour générer des UUID uniques

export async function seedData(dataSource: DataSource) {
  // Désactiver les contraintes de clé étrangère
  await dataSource.query('SET FOREIGN_KEY_CHECKS = 0;');

  // Tronquer les tables dans l'ordre inverse des dépendances
  await dataSource.getRepository(Post).clear();
  await dataSource.getRepository(Absence).clear();
  await dataSource.getRepository(Homework).clear();
  await dataSource.getRepository(Course).clear();
  await dataSource.getRepository(Student).clear();
  await dataSource.getRepository(Teacher).clear();

  // Réactiver les contraintes de clé étrangère
  await dataSource.query('SET FOREIGN_KEY_CHECKS = 1;');

  // Insérer les données
  const teachers = await seedTeachers(dataSource);
  const students = await seedStudents(dataSource);
  const courses = await seedCourses(dataSource, teachers, students);
  await seedHomework(dataSource, courses, teachers);
  await seedAbsences(dataSource, students, courses);
  await seedPosts(dataSource);
  // await seedUploadsForHomework(dataSource);
}

async function seedPosts(dataSource: DataSource) {
  const postsRepository = dataSource.getRepository(Post);
  await postsRepository.save([
    {
      id: 1,
      content: 'Bienvenue ! Préparez-vous à apprendre JS',
      course: { id: 1 },
    },
    {
      id: 2,
      content: 'Bienvenue ! Préparez-vous à apprendre Node.js',
      course: { id: 2 },
    },
    {
      id: 3,
      content: 'Bienvenue ! Préparez-vous à apprendre les bases de données',
      course: { id: 3 },
    },
    {
      id: 4,
      content: 'Les requêtes SQL sont essentielles pour la gestion des bases de données.',
      course: { id: 3 },
    },
    {
      id: 5,
      content: 'React est une bibliothèque puissante pour construire des interfaces utilisateur.',
      course: { id: 4 },
    },
    {
      id: 6,
      content: 'Python est excellent pour la science des données et l\'automatisation.',
      course: { id: 5 },
    },
  ]);
}

async function seedTeachers(dataSource: DataSource) {
  const teacherRepository = dataSource.getRepository(Teacher);

  const teachers = await teacherRepository.save([
    {
      id: "1", // Générer un UUID unique
      email: 'teacher1@email.com',
      firstName: 'John',
      lastName: 'Doe',
      type: UserType.Teacher,
      password: await argon2.hash('motdepasse'),
    },
    {
      id: "2",
      email: 'prof.smith@university.com',
      firstName: 'Jane',
      lastName: 'Smith',
      password: await argon2.hash('prof123'),
      type: UserType.Teacher,
    },
    {
      id: "3",
      email: 'prof.jones@university.com',
      firstName: 'Sarah',
      lastName: 'Jones',
      password: await argon2.hash('prof123'),
      type: UserType.Teacher,
    },
    {
      id: "4",
      email: 'prof.brown@university.com',
      firstName: 'Michael',
      lastName: 'Brown',
      password: await argon2.hash('prof123'),
      type: UserType.Teacher,
    },
  ]);

  return teachers;
}

async function seedStudents(dataSource: DataSource) {
  const studentRepository = dataSource.getRepository(Student);

  const students = await studentRepository.save([
    {
      id: "5",
      email: 'student1@university.com',
      firstName: 'Mike',
      lastName: 'Wilson',
      password: await argon2.hash('etudiant123'),
      group: 'A1',
      type: UserType.Student,
    },
    {
      id: "6",
      email: 'student2@university.com',
      firstName: 'Emma',
      lastName: 'Brown',
      password: await argon2.hash('student123'), 
      group: 'A1',
      type: UserType.Student,
    },
    {
      id: "7",
      email: 'student3@university.com',
      firstName: 'James',
      lastName: 'Davis',
      password: await argon2.hash('etudiant123'),
      group: 'B1',
      type: UserType.Student,
    },
    {
      id: "8",
      email: 'student4@university.com',
      firstName: 'Olivia',
      lastName: 'Miller',
      password: await argon2.hash('etudiant123'),
      group: 'B1',
      type: UserType.Student,
    },
    {
      id: "9",
      email: 'student5@university.com',
      firstName: 'Liam',
      lastName: 'Johnson',
      password: await argon2.hash('etudiant123'),
      group: 'A2',
      type: UserType.Student,
    },
  ]) ;

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
      title: 'Introduction à la programmation',
      description: 'Apprenez les bases de la programmation avec JavaScript',
      type: 'cours',
      startDate: new Date('2024-03-01'),
      endDate: new Date('2024-06-30'),
      teacher: teachers[0],
      students: students,
    },
    {
      id: 2,
      title: 'Développement Web',
      description: 'Développement web full stack avec Node.js',
      type: 'tutoriel',
      startDate: new Date('2024-03-01'),
      endDate: new Date('2024-06-30'),
      teacher: teachers[1],
      students: [students[0], students[1], students[2]],
    },
    {
      id: 3,
      title: 'Systèmes de bases de données',
      description: 'Introduction aux bases de données SQL et NoSQL',
      type: 'cours',
      startDate: new Date('2024-03-01'),
      endDate: new Date('2024-06-30'),
      teacher: teachers[0],
      students: students,
    },
    {
      id: 4,
      title: 'React pour débutants',
      description: 'Apprenez React à partir de zéro',
      type: 'tutoriel',
      startDate: new Date('2024-04-01'),
      endDate: new Date('2024-07-31'),
      teacher: teachers[2],
      students: [students[3], students[4]],
    },
    {
      id: 5,
      title: 'Programmation en Python',
      description: 'Apprenez Python pour la science des données et l\'automatisation',
      type: 'cours',
      startDate: new Date('2024-05-01'),
      endDate: new Date('2024-08-31'),
      teacher: teachers[3],
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
      title: 'Devoir 1',
      description: 'Créez une application JavaScript simple',
      deadline: new Date('2025-03-15'),
      course: courses[0],
      teacher: teachers[0],
    },
    {
      id: 2,
      title: 'Devoir 2',
      description: 'Construisez une API REST avec Express.js',
      deadline: new Date('2024-03-20'),
      course: courses[1],
      teacher: teachers[1],
    },
    {
      id: 3,
      title: 'Devoir 3',
      description: 'Concevez et implémentez un schéma de base de données',
      deadline: new Date('2024-03-25'),
      course: courses[2],
      teacher: teachers[0],
    },
    {
      id: 4,
      title: 'Devoir 4',
      description: 'Créez des tests unitaires pour votre API',
      deadline: new Date('2024-04-01'),
      course: courses[1],
      teacher: teachers[1],
    },
    {
      id: 5,
      title: 'Devoir 5',
      description: 'Construisez un composant React',
      deadline: new Date('2024-04-10'),
      course: courses[3],
      teacher: teachers[2],
    },
    {
      id: 6,
      title: 'Devoir 6',
      description: 'Écrivez un script Python pour l\'analyse de données',
      deadline: new Date('2024-04-15'),
      course: courses[4],
      teacher: teachers[3],
    },
    {
      id: 7,
      title: 'Devoir 7',
      description: 'Créez un serveur web en Node',
      deadline: new Date('2024-03-15'),
      course: courses[0],
      teacher: teachers[0],
    },
  ]);
}

async function seedAbsences(
  dataSource: DataSource,
  students: Student[],
  courses: Course[],
) {
  const absenceRepository = dataSource.getRepository(Absence);

  await absenceRepository.save([
    // Étudiant 1
    {
      id: 1,
      student: students[0],
      course: courses[0],
      date: new Date('2024-03-05'),
      justified: false,
      justification: null,
    },
    {
      id: 13,
      student: students[0],
      course: courses[0],
      date: new Date('2024-03-07'),
      justified: false,
      justification: null,
    },
    {
      id: 14,
      student: students[0],
      course: courses[0],
      date: new Date('2024-03-10'),
      justified: false,
      justification: null,
    },
    {
      id: 15,
      student: students[0],
      course: courses[1],
      date: new Date('2024-03-10'),
      justified: false,
      justification: null,
    },
    {
      id: 16,
      student: students[0],
      course: courses[2],
      date: new Date('2024-03-07'),
      justified: false,
      justification: null,
    },
    {
      id: 17,
      student: students[0],
      course: courses[2],
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
      justified: true,
      justification: 'Rendez-vous médical',
    },

    // Étudiant 2
    {
      id: 4,
      student: students[1],
      course: courses[1],
      date: new Date('2024-03-10'),
      justified: true,
      justification: 'Urgence familiale',
    },
    {
      id: 5,
      student: students[1],
      course: courses[1],
      date: new Date('2024-03-20'),
      justified: false,
      justification: null,
    },

    // Étudiant 3
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
      justified: true,
      justification: 'Problèmes techniques',
    },
    {
      id: 8,
      student: students[2],
      course: courses[2],
      date: new Date('2024-03-28'),
      justified: false,
      justification: null,
    },

    // Étudiant 4
    {
      id: 9,
      student: students[3],
      course: courses[3],
      date: new Date('2024-04-05'),
      justified: true,
      justification: 'Raisons personnelles',
    },
    {
      id: 10,
      student: students[3],
      course: courses[3],
      date: new Date('2024-04-12'),
      justified: false,
      justification: null,
    },

    // Étudiant 5
    {
      id: 11,
      student: students[4],
      course: courses[4],
      date: new Date('2024-05-01'),
      justified: false,
      justification: null,
    },
    {
      id: 12,
      student: students[4],
      course: courses[4],
      date: new Date('2024-05-08'),
      justified: true,
      justification: 'Voyage',
    },
  ]);
}

async function seedUploadsForHomework(dataSource: DataSource) {
  const homeworkRepository = dataSource.getRepository(Homework);
  const homework1 = await homeworkRepository.findOneBy({ id: 1 });
  await homeworkRepository.save({ ...homework1, files: [{ id: 1 }, { id: 2 }] })
}