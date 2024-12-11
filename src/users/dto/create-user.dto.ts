import { IsEmail, IsEnum, IsNotEmpty, MinLength } from 'class-validator';
import { UserType } from '../enums/user-type.enum';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  firstName: string;

  @IsNotEmpty()
  lastName: string;

  @IsNotEmpty()
  @IsEnum(UserType)
  type: UserType;

  @IsNotEmpty()
  @MinLength(8)
  password: string;
}
