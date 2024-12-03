import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as argon2 from 'argon2';
import { CrudService } from 'src/common/generics/crud.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ID } from 'src/common/generics/has-id.interface';

@Injectable()
export class UsersService extends CrudService<User> {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {
    super(usersRepository);
  }
  async create(createUserDto: CreateUserDto): Promise<User> {
    const userByEmail = await this.findOneByEmail(createUserDto.email);
    if (userByEmail) {
      throw new BadRequestException('Email already used.');
    }

    const hash = await this.hashPassword(createUserDto.password);
    const newUser = {
      ...createUserDto,
      password: hash,
    };
    return super.create(newUser);
  }

  async update(id: ID, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException(`User with id:${id} not exists`);
    }

    const userByEmail = await this.findOneByEmail(updateUserDto.email);
    if (userByEmail && userByEmail.id != (id as string)) {
      throw new BadRequestException('Email already used.');
    }

    return super.update(id, updateUserDto);
  }

  async findOneByEmail(email: string): Promise<User> {
    return await this.usersRepository.findOneBy({ email });
  }

  hashPassword(data: string) {
    return argon2.hash(data);
  }
}
