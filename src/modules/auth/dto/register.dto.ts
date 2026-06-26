import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ 
    description: 'The unique email address of the user', 
    example: 'sepanta@example.com' 
  })
  @IsEmail({}, { message: 'Invalid email format standard' })
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ 
    description: 'Alphanumeric username with underscores allowed', 
    example: 'sepanta_dev' 
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  @Matches(/^[a-zA-Z0-9_]+$/, { message: 'Username must contain only alphanumeric characters and underscores' })
  username!: string;

  @ApiProperty({ 
    description: 'Secure account password (min length 8)', 
    example: 'P@ssword2026' 
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(32)
  password!: string;
}