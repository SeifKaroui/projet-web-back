import { User } from 'src/users/entities/user.entity';
import { DataSource } from 'typeorm';
import * as argon2 from 'argon2';
import { UserType } from 'src/users/enums/user-type.enum';

export async function seedData(dataSource: DataSource) {
  await seedUsers(dataSource);
}

async function seedUsers(dataSource: DataSource) {
  const usersRepository = dataSource.getRepository(User);

  await usersRepository.save([
    {
      id: '107fcda6-ebfc-4135-a1dd-e1003e608619',
      email: 'teacher1@email.com',
      firstName: 'teacher1',
      lastName: 'Ben foulen',
      type: UserType.Teacher,
      password: await argon2.hash('password'),
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
  ]);
}
