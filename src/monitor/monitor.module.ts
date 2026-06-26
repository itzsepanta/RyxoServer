// src/monitor/monitor.module.ts

import { Module } from '@nestjs/common';
import { MonitorService } from './monitor.service';
import { MonitorController } from './monitor.controller';

@Module({
  controllers: [MonitorController],
  providers: [MonitorService],
  exports: [MonitorService] // Exports the engine if other internal components wish to interface with telemetry loops
})
export class MonitorModule {}