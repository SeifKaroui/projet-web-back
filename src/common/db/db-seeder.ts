import { User } from 'src/users/entities/user.entity';
import { DataSource } from 'typeorm';
import * as argon2 from 'argon2';

export async function seedData(dataSource: DataSource) {
  await seedUsers(dataSource);
}

async function seedUsers(dataSource: DataSource) {
  const usersRepository = dataSource.getRepository(User);

  await usersRepository.save([
    {
      id: '107fcda6-ebfc-4135-a1dd-e1003e608619',
      email: 'user1@email.com',
      firstName: 'user1',
      lastName: 'Ben foulen',
      password: await argon2.hash('password'),
    },

    {
      id: '207fcda6-ebfc-4135-a1dd-e1003e608619',
      email: 'user2@email.com',
      firstName: 'user2',
      lastName: 'Ben foulen',
      password: await argon2.hash('password'),
    },
  ]);
}
