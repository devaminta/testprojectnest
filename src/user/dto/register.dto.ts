import { IsEmail, IsNotEmpty, IsOptional, MinLength } from 'class-validator';

export class RegisterUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsNotEmpty()
  fullname: string;

  @IsOptional()
  role?: 'User' | 'Admin'; // Optional, defaults to 'User'
}
