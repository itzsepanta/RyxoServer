import { Controller, Get, UseGuards, HttpCode, HttpStatus, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { AuthGuard } from './auth.guard';
import { RolesGuard } from './roles.guard';
import { Roles, UserRole } from './roles.decorator';

@ApiTags('Management & Systems')
@ApiBearerAuth('JWT-Auth')
@Controller('management')
@UseGuards(AuthGuard, RolesGuard)
export class ManagementController {
  
  @Get('metrics')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(CacheInterceptor) // Intercepts the route to process or serve cached system buffers
  @ApiOperation({ summary: 'Retrieve high-performance cached core system metrics [ADMIN ONLY]' })
  @ApiResponse({ status: 200, description: 'Secure analytics cache context loaded successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized: Invalid or missing token.' })
  @ApiResponse({ status: 403, description: 'Forbidden: Insufficient privileges.' })
  getSystemMetrics() {
    return {
      status: 'success',
      timestamp: new Date().toISOString(),
      cacheStatus: 'Serving optimized in-memory system computation',
      data: {
        memoryUsage: process.memoryUsage(),
        uptime: process.uptime(),
      },
    };
  }
}