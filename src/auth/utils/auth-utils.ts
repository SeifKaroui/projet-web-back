import * as argon2 from 'argon2';

export class AuthUtils {
  static async hashPassword(password: string): Promise<string> {
    return argon2.hash(password);
  }
}
