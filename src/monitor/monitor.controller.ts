import { Controller, Get, Post, Delete, Body, Param, HttpCode, HttpStatus, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { MonitorService } from './monitor.service';
import { MonitorTarget, GlobalInfrastructureCluster } from './interfaces/monitor.interface';

// 1. DTO Declarations for strict Swagger Schema validation
export class CreateMonitorTargetDto {
  name!: string;
  protocol!: 'HTTP' | 'HTTPS' | 'TCP' | 'UDP';
  target!: string;
  interval?: number;
  acceptedCodes?: number[];
}

@ApiTags('Infrastructure Monitoring Engine')
@ApiBearerAuth('JWT-Auth')
@Controller('monitor')
export class MonitorController {
  constructor(private readonly monitorService: MonitorService) {}

  @Get('status-pool')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Fetch Live Infrastructure Cluster Status Pool',
    description: 'Returns real-time data feeds, global operational ratios, and binary 24h bitstreams for standard status page rendering.' 
  })
  @ApiResponse({ status: 200, description: 'Cluster telemetry matrices successfully retrieved.' })
  public getLiveInfrastructurePool(): GlobalInfrastructureCluster {
    return this.monitorService.compileGlobalClusterAnalytics();
  }

  @Get('targets')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Retrieve All Registered Telemetry Monitoring Targets',
    description: 'Yields an array of all active checking loops mapped within the RyxoServer background infrastructure core.' 
  })
  @ApiResponse({ status: 200, description: 'Target telemetry entries successfully synchronized.' })
  public retrieveRegisteredTargets(): MonitorTarget[] {
    return this.monitorService.fetchAllTargets();
  }

  @Post('targets')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Provision and Pipeline a New Infrastructure Monitor Target',
    description: 'Registers a new automated polling node into the active background thread pools using HTTP, HTTPS, TCP, or UDP sockets.' 
  })
  @ApiBody({
    description: 'Payload structure required to spin up a new checking micro-engine',
    type: CreateMonitorTargetDto,
    examples: {
      httpExample: {
        summary: 'Register HTTP/HTTPS Target',
        value: { name: 'Example 1', protocol: 'HTTPS', target: 'ryxo.ir', interval: 30, acceptedCodes: [200, 201, 304] }
      },
      tcpExample: {
        summary: 'Register Direct TCP/VPN Socket Port',
        value: { name: 'Example 2', protocol: 'TCP', target: '127.0.0.1:443', interval: 10 }
      }
    }
  })
  @ApiResponse({ status: 201, description: 'Target micro-engine successfully deployed and active.' })
  @ApiResponse({ status: 400, description: 'Structural fields validation constraint mismatch constraint.' })
  public provisionNewMonitorTarget(
    @Body() payload: CreateMonitorTargetDto
  ): MonitorTarget {
    if (!payload.name || !payload.protocol || !payload.target) {
      throw new BadRequestException('Request execution failed: structural fields validation constraint mismatch.');
    }
    
    return this.monitorService.registerMonitorTarget({
      name: payload.name,
      protocol: payload.protocol,
      target: payload.target,
      interval: payload.interval || 60,
      acceptedCodes: payload.acceptedCodes
    });
  }

  @Delete('targets/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Terminate and Evict Active Monitor Pipeline Loop',
    description: 'Halts the background interval checker thread instantly and purges all historical in-memory metrics for the given entity token.' 
  })
  @ApiParam({ name: 'id', description: 'The unique identifier token generated for the monitor (e.g., mon_988ead76)' })
  @ApiResponse({ status: 200, description: 'Background monitoring cycle successfully dismantled.' })
  @ApiResponse({ status: 404, description: 'Monitor entity with the provided identifier does not exist.' })
  public terminateMonitorPipeline(@Param('id') id: string): { success: boolean; message: string } {
    this.monitorService.evictMonitorTarget(id);
    return {
      success: true,
      message: `Successfully halted monitoring tasks and removed entity associated with token reference "${id}".`
    };
  }
}