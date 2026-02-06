import { IsNotEmpty, IsEmail, MinLength } from 'class-validator';
import { IUser } from '../interfaces/user.interface';

export class UserEntity implements IUser {
  id?: string;

  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @IsNotEmpty()
  roleId: string;

  avatar?: string;
  createdAt?: Date;

  role?: any;
}
