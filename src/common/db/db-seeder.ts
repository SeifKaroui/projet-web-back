import { User, Teacher, Student } from 'src/users/entities/user.entity';
import { Course } from 'src/courses/entities/course.entity';
import { Absence } from 'src/absences/entities/absence.entity';
import { DataSource } from 'typeorm';
import * as argon2 from 'argon2';
import { UserType } from 'src/users/enums/user-type.enum';
import { Homework } from 'src/homework/entities/homework.entity';
import { Post } from 'src/posts/entities/post.entity';

// Date fixe utilisée pour la création de toutes les entités
const FIXED_CREATION_DATE = new Date('2024-01-01T00:00:00Z');

export async function seedData(dataSource: DataSource) {
  // Vérifier si la table Teacher est vide
  const teacherRepository = dataSource.getRepository(Teacher);
  const teachersCount = await teacherRepository.count();

  // Si des enseignants existent déjà, on considère que la BD est déjà initialisée
  if (teachersCount > 0) {
    console.log('La base de données est déjà initialisée. Le seeder ne va pas écraser les données existantes.');
    return;
  }

  // Désactiver temporairement les contraintes de clé étrangère
  await dataSource.query('SET FOREIGN_KEY_CHECKS = 0;');

  // Vider (clear) les tables dans l'ordre inverse des dépendances
  await dataSource.getRepository(Post).clear();
  await dataSource.getRepository(Absence).clear();
  await dataSource.getRepository(Homework).clear();
  await dataSource.getRepository(Course).clear();
  await dataSource.getRepository(Student).clear();
  await teacherRepository.clear();

  // Vider explicitement la table de jointure entre Users et Courses
  await dataSource.query('DELETE FROM user_enrolled_courses');

  // Si d'autres tables de jointure existent (ex. : homework_submissions), les vider également
  // await dataSource.query('DELETE FROM homework_submissions');

  // Réactiver les contraintes de clé étrangère
  await dataSource.query('SET FOREIGN_KEY_CHECKS = 1;');

  // Insertion des données dans le bon ordre avec une date de création fixe
  const teachers = await seedTeachers(dataSource);
  const students = await seedStudents(dataSource);
  const courses = await seedCourses(dataSource, teachers, students);
  await seedHomework(dataSource, courses, teachers);
  await seedAbsences(dataSource, students, courses);
  await seedPosts(dataSource);
}

async function seedPosts(dataSource: DataSource) {
  const postsRepository = dataSource.getRepository(Post);
  await postsRepository.save([
    {
      id: 1,
      content: 'Bienvenue ! Préparez-vous à apprendre le JavaScript',
      course: { id: 1 },
      createdAt: FIXED_CREATION_DATE,
    },
    {
      id: 2,
      content: 'Bienvenue ! Préparez-vous à apprendre Node.js',
      course: { id: 2 },
      createdAt: FIXED_CREATION_DATE,
    },
    {
      id: 3,
      content: 'Bienvenue ! Préparez-vous à découvrir les bases de données',
      course: { id: 3 },
      createdAt: FIXED_CREATION_DATE,
    },
    {
      id: 4,
      content: 'Les requêtes SQL sont essentielles pour la gestion des bases de données.',
      course: { id: 3 },
      createdAt: FIXED_CREATION_DATE,
    },
    {
      id: 5,
      content: 'React est une bibliothèque puissante pour construire des interfaces utilisateur.',
      course: { id: 4 },
      createdAt: FIXED_CREATION_DATE,
    },
    {
      id: 6,
      content: "Python est idéal pour la data science et l'automatisation.",
      course: { id: 5 },
      createdAt: FIXED_CREATION_DATE,
    },
  ]);
}

async function seedTeachers(dataSource: DataSource) {
  const teacherRepository = dataSource.getRepository(Teacher);

  const teachers = await teacherRepository.save([
    {
      id: '11111111-1111-1111-1111-111111111111', // ID fixe
      email: 'teacher1@email.com',
      firstName: 'John',
      lastName: 'Doe',
      type: UserType.Teacher,
      password: await argon2.hash('password'),
      createdAt: FIXED_CREATION_DATE,
    },
    {
      id: '22222222-2222-2222-2222-222222222222',
      email: 'prof.smith@university.com',
      firstName: 'Jane',
      lastName: 'Smith',
      password: await argon2.hash('teacher123'),
      type: UserType.Teacher,
      createdAt: FIXED_CREATION_DATE,
    },
    {
      id: '33333333-3333-3333-3333-333333333333',
      email: 'prof.jones@university.com',
      firstName: 'Sarah',
      lastName: 'Jones',
      password: await argon2.hash('teacher123'),
      type: UserType.Teacher,
      createdAt: FIXED_CREATION_DATE,
    },
    {
      id: '44444444-4444-4444-4444-444444444444',
      email: 'prof.brown@university.com',
      firstName: 'Michael',
      lastName: 'Brown',
      password: await argon2.hash('teacher123'),
      type: UserType.Teacher,
      createdAt: FIXED_CREATION_DATE,
    },
  ]);

  return teachers;
}

async function seedStudents(dataSource: DataSource) {
  const studentRepository = dataSource.getRepository(Student);

  const students = await studentRepository.save([
    {
      id: '55555555-5555-5555-5555-555555555555', // ID fixe
      email: 'student1@university.com',
      firstName: 'Mike',
      lastName: 'Wilson',
      password: await argon2.hash('student123'),
      group: 'A1',
      type: UserType.Student,
      createdAt: FIXED_CREATION_DATE,
    },
    {
      id: '66666666-6666-6666-6666-666666666666',
      email: 'student2@university.com',
      firstName: 'Emma',
      lastName: 'Brown',
      password: await argon2.hash('student123'),
      group: 'A1',
      type: UserType.Student,
      createdAt: FIXED_CREATION_DATE,
    },
    {
      id: '77777777-7777-7777-7777-777777777777',
      email: 'student3@university.com',
      firstName: 'James',
      lastName: 'Davis',
      password: await argon2.hash('student123'),
      group: 'B1',
      type: UserType.Student,
      createdAt: FIXED_CREATION_DATE,
    },
    {
      id: '88888888-8888-8888-8888-888888888888',
      email: 'student4@university.com',
      firstName: 'Olivia',
      lastName: 'Miller',
      password: await argon2.hash('student123'),
      group: 'B1',
      type: UserType.Student,
      createdAt: FIXED_CREATION_DATE,
    },
    {
      id: '99999999-9999-9999-9999-999999999999',
      email: 'student5@university.com',
      firstName: 'Liam',
      lastName: 'Johnson',
      password: await argon2.hash('student123'),
      group: 'A2',
      type: UserType.Student,
      createdAt: FIXED_CREATION_DATE,
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
      title: 'Introduction à la Programmation',
      description: 'Apprenez les bases de la programmation avec JavaScript',
      type: 'cours magistral',
      startDate: new Date('2024-03-01'),
      endDate: new Date('2024-06-30'),
      teacher: teachers[0],
      students: students, // tous les étudiants
      createdAt: FIXED_CREATION_DATE,
    },
    {
      id: 2,
      title: 'Développement Web',
      description: 'Développement web full-stack avec Node.js',
      type: 'travaux pratiques',
      startDate: new Date('2024-03-01'),
      endDate: new Date('2024-06-30'),
      teacher: teachers[1],
      students: [students[0], students[1], students[2]],
      createdAt: FIXED_CREATION_DATE,
    },
    {
      id: 3,
      title: 'Systèmes de Bases de Données',
      description: 'Introduction à SQL et aux bases de données NoSQL',
      type: 'cours magistral',
      startDate: new Date('2024-03-01'),
      endDate: new Date('2024-06-30'),
      teacher: teachers[0],
      students: students,
      createdAt: FIXED_CREATION_DATE,
    },
    {
      id: 4,
      title: 'React pour Débutants',
      description: 'Apprenez React à partir de zéro',
      type: 'travaux pratiques',
      startDate: new Date('2024-04-01'),
      endDate: new Date('2024-07-31'),
      teacher: teachers[2],
      students: [students[3], students[4]],
      createdAt: FIXED_CREATION_DATE,
    },
    {
      id: 5,
      title: 'Programmation Python',
      description: "Apprenez Python pour la data science et l'automatisation",
      type: 'cours magistral',
      startDate: new Date('2024-05-01'),
      endDate: new Date('2024-08-31'),
      teacher: teachers[3],
      students: students,
      createdAt: FIXED_CREATION_DATE,
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
      description: 'Créer une application JavaScript simple',
      deadline: new Date('2025-03-15'),
      course: courses[0],
      teacher: teachers[0],
      createdAt: FIXED_CREATION_DATE,
    },
    {
      id: 2,
      title: 'Devoir 2',
      description: "Construire une API REST avec Express.js",
      deadline: new Date('2025-03-20'),
      course: courses[1],
      teacher: teachers[1],
      createdAt: FIXED_CREATION_DATE,
    },
    {
      id: 3,
      title: 'Devoir 3',
      description: 'Concevoir et implémenter un schéma de base de données',
      deadline: new Date('2024-03-25'),
      course: courses[2],
      teacher: teachers[0],
      createdAt: FIXED_CREATION_DATE,
    },
    {
      id: 4,
      title: 'Devoir 4',
      description: 'Créer des tests unitaires pour votre API',
      deadline: new Date('2024-04-01'),
      course: courses[1],
      teacher: teachers[1],
      createdAt: FIXED_CREATION_DATE,
    },
    {
      id: 5,
      title: 'Devoir 5',
      description: 'Construire un composant React',
      deadline: new Date('2024-04-10'),
      course: courses[3],
      teacher: teachers[2],
      createdAt: FIXED_CREATION_DATE,
    },
    {
      id: 6,
      title: 'Devoir 6',
      description: "Écrire un script Python pour l'analyse de données",
      deadline: new Date('2024-04-15'),
      course: courses[4],
      teacher: teachers[3],
      createdAt: FIXED_CREATION_DATE,
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
      createdAt: FIXED_CREATION_DATE,
    },
    {
      id: 13,
      student: students[0],
      course: courses[0],
      date: new Date('2024-03-07'),
      justified: false,
      justification: null,
      createdAt: FIXED_CREATION_DATE,
    },
    {
      id: 14,
      student: students[0],
      course: courses[0],
      date: new Date('2024-03-10'),
      justified: false,
      justification: null,
      createdAt: FIXED_CREATION_DATE,
    },
    {
      id: 15,
      student: students[0],
      course: courses[1],
      date: new Date('2024-03-10'),
      justified: false,
      justification: null,
      createdAt: FIXED_CREATION_DATE,
    },
    {
      id: 16,
      student: students[0],
      course: courses[2],
      date: new Date('2024-03-07'),
      justified: false,
      justification: null,
      createdAt: FIXED_CREATION_DATE,
    },
    {
      id: 17,
      student: students[0],
      course: courses[2],
      date: new Date('2024-03-05'),
      justified: false,
      justification: null,
      createdAt: FIXED_CREATION_DATE,
    },
    {
      id: 2,
      student: students[0],
      course: courses[0],
      date: new Date('2024-03-12'),
      justified: false,
      justification: null,
      createdAt: FIXED_CREATION_DATE,
    },
    {
      id: 3,
      student: students[0],
      course: courses[0],
      date: new Date('2024-03-18'),
      justified: true,
      justification: 'Rendez-vous médical',
      createdAt: FIXED_CREATION_DATE,
    },

    // Étudiant 2
    {
      id: 4,
      student: students[1],
      course: courses[1],
      date: new Date('2024-03-10'),
      justified: true,
      justification: 'Urgence familiale',
      createdAt: FIXED_CREATION_DATE,
    },
    {
      id: 5,
      student: students[1],
      course: courses[1],
      date: new Date('2024-03-20'),
      justified: false,
      justification: null,
      createdAt: FIXED_CREATION_DATE,
    },

    // Étudiant 3
    {
      id: 6,
      student: students[2],
      course: courses[2],
      date: new Date('2024-03-15'),
      justified: false,
      justification: null,
      createdAt: FIXED_CREATION_DATE,
    },
    {
      id: 7,
      student: students[2],
      course: courses[2],
      date: new Date('2024-03-22'),
      justified: true,
      justification: 'Problèmes techniques',
      createdAt: FIXED_CREATION_DATE,
    },
    {
      id: 8,
      student: students[2],
      course: courses[2],
      date: new Date('2024-03-28'),
      justified: false,
      justification: null,
      createdAt: FIXED_CREATION_DATE,
    },

    // Étudiant 4
    {
      id: 9,
      student: students[3],
      course: courses[3],
      date: new Date('2024-04-05'),
      justified: true,
      justification: 'Raisons personnelles',
      createdAt: FIXED_CREATION_DATE,
    },
    {
      id: 10,
      student: students[3],
      course: courses[3],
      date: new Date('2024-04-12'),
      justified: false,
      justification: null,
      createdAt: FIXED_CREATION_DATE,
    },

    // Étudiant 5
    {
      id: 11,
      student: students[4],
      course: courses[4],
      date: new Date('2024-05-01'),
      justified: false,
      justification: null,
      createdAt: FIXED_CREATION_DATE,
    },
    {
      id: 12,
      student: students[4],
      course: courses[4],
      date: new Date('2024-05-08'),
      justified: true,
      justification: 'Voyage',
      createdAt: FIXED_CREATION_DATE,
    },
  ]);
}
