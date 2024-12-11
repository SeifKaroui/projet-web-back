import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CrudService } from 'src/common/generics/crud.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthUtils } from 'src/auth/utils/auth-utils';

@Injectable()
export class UsersService extends CrudService<User> {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {
    super(usersRepository);
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const userByEmail = await this.usersRepository.findOneBy({
      email: createUserDto.email,
    });
    if (userByEmail) {
      throw new BadRequestException('Email already used.');
    }

    const hash = await AuthUtils.hashPassword(createUserDto.password);
    const newUser = {
      ...createUserDto,
      password: hash,
    };

    return this.usersRepository.save(newUser);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const userExists = await this.findOne(id);
    if (!userExists) {
      throw new NotFoundException(`User with id:${id} not exists`);
    }

    const userByEmail = await this.findOneByEmail(updateUserDto.email);
    const isEmailUsedByOthers = userByEmail && userByEmail.id != id;
    if (updateUserDto.email && isEmailUsedByOthers) {
      throw new BadRequestException('Email already used.');
    }

    return super.update(id, updateUserDto);
  }

  findOneByEmail(email: string): Promise<User> {
    return this.usersRepository.findOneBy({ email });
  }
}
