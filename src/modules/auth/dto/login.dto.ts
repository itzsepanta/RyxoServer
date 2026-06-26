import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ 
    description: 'Registered username or email address', 
    example: 'sepanta_dev' 
  })
  @IsNotEmpty()
  @IsString()
  usernameOrEmail!: string;

  @ApiProperty({ 
    description: 'Account access password parameter', 
    example: 'P@ssword2026' 
  })
  @IsNotEmpty()
  @IsString()
  password!: string;
}