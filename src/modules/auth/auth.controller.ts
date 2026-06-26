import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new identity user account within RyxoServer' })
  @ApiResponse({ status: 201, description: 'User structural account deployed successfully.' })
  @ApiResponse({ status: 400, description: 'Bad Request: Provided payload validation failure.' })
  @ApiResponse({ status: 409, description: 'Conflict: Identity credentials already registered.' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate user and exchange credentials for an absolute Access Token' })
  @ApiResponse({ status: 200, description: 'Successful cryptographic token generation.' })
  @ApiResponse({ status: 401, description: 'Unauthorized: Invalid cryptographic parameters.' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}