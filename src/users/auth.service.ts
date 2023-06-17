import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(private userService: UsersService) {}

  async signup(email: string, password: string) {
    //See if email in use
    const users = await this.userService.find(email);
    if (users.length > 0) {
      throw new BadRequestException('email in use');
    }

    //Hash the password
    //Generate salt
    const salt = randomBytes(8).toString('hex');
    //Hash salt and password
    const hash = (await scrypt(password, salt, 32)) as Buffer;

    ///create new user and save it
    const result = salt + '.' + hash.toString('hex');
    const user = await this.userService.create(email, result);
    //return the user
    return user;
  }

  async signin(email: string, password: string) {
    const [user] = await this.userService.find(email);
    if (!user) {
      throw new NotFoundException('email not found');
    }
    const [salt, storedHash] = user.password.split('.');

    const hash = (await scrypt(password, salt, 32)) as Buffer;
    const hash2 = hash.toString('hex');
    console.log('Salt= ' + salt);

    console.log('password + salt + scrypt = ' + hash2);

    console.log('Stored Hash = ' + storedHash);

    console.log('password + salt + scrypt, should = stored hash');

    if (storedHash === hash.toString('hex')) {
      return user;
    } else {
      throw new BadRequestException('bad password');
    }
  }
}
