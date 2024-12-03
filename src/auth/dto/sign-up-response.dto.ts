import { User } from 'src/users/entities/user.entity';

export class SignUpResponseDto {
  public user: User;
  public accessToken: string;
  public refreshToken: string;
}
