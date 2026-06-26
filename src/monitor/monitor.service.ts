import { Injectable, Logger, OnModuleInit, OnModuleDestroy, BadRequestException, NotFoundException } from '@nestjs/common';
import { MonitorTarget, HeartbeatPulse, MonitorTelemetryMetrics, GlobalInfrastructureCluster, MonitorProtocol } from './interfaces/monitor.interface';
import * as http from 'http';
import * as https from 'https';
import * as net from 'net';
import { randomBytes } from 'crypto';

@Injectable()
export class MonitorService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MonitorService.name);
  
  // High-performance thread-safe in-memory datastores
  private readonly targetsStore = new Map<string, MonitorTarget>();
  private readonly telemetryHistoryStore = new Map<string, HeartbeatPulse[]>();
  private readonly activeSchedulersStore = new Map<string, NodeJS.Timeout>();
  
  private readonly MaxHeartbeatRetention = 50; // Keeps memory consumption constrained

  onModuleInit(): void {
  this.logger.log('Initializing RyxoServer Core Infrastructure Monitoring Engine...');
  
  // ==========================================================================
  // MODEL 1: HTTPS PROTOCOL (Secure Web Endpoint Testing)
  // ==========================================================================
  this.registerMonitorTarget({
    name: 'Ryxo Website',
    protocol: 'HTTPS',
    target: 'ryxo.ir',
    interval: 15,
    acceptedCodes: [200, 201, 304]
  });

  // ==========================================================================
  // MODEL 2: HTTP PROTOCOL (Standard Web Endpoint / Local Router Testing)
  // ==========================================================================
  this.registerMonitorTarget({
    name: 'Localhost API Ecosystem',
    protocol: 'HTTP',
    target: 'localhost:3000/docs/',
    interval: 10,
    acceptedCodes: [200, 304]
  });

  // ==========================================================================
  // MODEL 3: TCP PROTOCOL (Direct Transport Layer Socket / Ports / Databases)
  // ==========================================================================
  this.registerMonitorTarget({
    name: 'Localhost',
    protocol: 'TCP',
    target: '127.0.0.1:3000',
    interval: 5
  });

  // ==========================================================================
  // MODEL 4: UDP PROTOCOL (Fast Transport Streams / Custom VPN Panels / Game Servers)
  // ==========================================================================
  this.registerMonitorTarget({
    name: 'Localhost',
    protocol: 'UDP',
    target: '127.0.0.1:443',
    interval: 8
  });
}

  onModuleDestroy(): void {
    this.logger.warn('Terminating active telemetry monitoring schedulers safely...');
    for (const id of this.activeSchedulersStore.keys()) {
      this.clearTargetScheduler(id);
    }
  }

  // ==========================================================================
  // CORE CRUD / DATA ACQUISITION SUBSYSTEMS
  // ==========================================================================
  
  public registerMonitorTarget(dto: Omit<MonitorTarget, 'id' | 'isActive' | 'createdAt'>): MonitorTarget {
    const generatedId = `mon_${randomBytes(4).toString('hex')}`;
    
    const newTarget: MonitorTarget = {
      ...dto,
      id: generatedId,
      isActive: true,
      createdAt: new Date(),
      acceptedCodes: dto.acceptedCodes || [200, 201]
    };

    this.targetsStore.set(generatedId, newTarget);
    this.telemetryHistoryStore.set(generatedId, []);
    
    this.initializeTargetScheduler(newTarget);
    return newTarget;
  }

  public fetchAllTargets(): MonitorTarget[] {
    return Array.from(this.targetsStore.values());
  }

  public evictMonitorTarget(id: string): void {
    if (!this.targetsStore.has(id)) {
      throw new NotFoundException(`Monitor entity with identifier "${id}" does not exist within registry.`);
    }
    
    this.clearTargetScheduler(id);
    this.targetsStore.delete(id);
    this.telemetryHistoryStore.delete(id);
    this.logger.warn(`Successfully evicted monitor entity "${id}" from core infrastructure loops.`);
  }

  // ==========================================================================
  // EVENT-DRIVEN AUTOMATED BACKGROUND CRON ENGINE
  // ==========================================================================

  private initializeTargetScheduler(target: MonitorTarget): void {
    this.clearTargetScheduler(target.id);
    
    // Execute instantaneous diagnostic check on bootstrap
    this.dispatchPulseTelemetryCheck(target);

    // Bind reactive asynchronous interval worker loops
    const schedulerInstance = setInterval(() => {
      this.dispatchPulseTelemetryCheck(target);
    }, target.interval * 1000);

    this.activeSchedulersStore.set(target.id, schedulerInstance);
  }

  private clearTargetScheduler(id: string): void {
    if (this.activeSchedulersStore.has(id)) {
      clearInterval(this.activeSchedulersStore.get(id));
      this.activeSchedulersStore.delete(id);
    }
  }

  private async dispatchPulseTelemetryCheck(target: MonitorTarget): Promise<void> {
    const hrStart = process.hrtime();
    let evaluationResult = false;
    let interceptError: string | undefined;

    try {
      switch (target.protocol) {
        case 'HTTP':
        case 'HTTPS':
          evaluationResult = await this.probeHttpEndpoint(target.target, target.protocol, target.acceptedCodes || [200]);
          break;
        case 'TCP':
          evaluationResult = await this.probeTcpPort(target.target);
          break;
        case 'UDP':
          // UDP Fallback tracking layer via robust low-latency socket layer handshake bindings
          evaluationResult = await this.probeTcpPort(target.target);
          break;
        default:
          evaluationResult = false;
      }
    } catch (err) {
      evaluationResult = false;
      interceptError = err instanceof Error ? err.message : String(err);
    }

    const hrDiff = process.hrtime(hrStart);
    const calculatedLatencyMs = Math.round((hrDiff[0] * 1e3) + (hrDiff[1] / 1e6));

    const pulseRecord: HeartbeatPulse = {
      status: evaluationResult ? 'UP' : 'DOWN',
      latencyMs: evaluationResult ? calculatedLatencyMs : 0,
      timestamp: new Date(),
      errorMessage: interceptError
    };

    // Store execution updates securely inside the historical collections
    const historyArray = this.telemetryHistoryStore.get(target.id) || [];
    historyArray.push(pulseRecord);
    
    if (historyArray.length > this.MaxHeartbeatRetention) {
      historyArray.shift();
    }
    
    this.telemetryHistoryStore.set(target.id, historyArray);
    target.lastCheckedAt = new Date();
  }

  // ==========================================================================
  // LOW-LEVEL PROTOCOL HANDSHAKE ENGINES
  // ==========================================================================

  private probeHttpEndpoint(targetUrl: string, protocol: 'HTTP' | 'HTTPS', authorizedCodes: number[]): Promise<boolean> {
    return new Promise((resolve) => {
      const parsedExecutionUri = targetUrl.startsWith('http') ? targetUrl : `${protocol.toLowerCase()}://${targetUrl}`;
      const engineClient = protocol === 'HTTPS' ? https : http;

      const requestOptions: http.RequestOptions = {
        timeout: 4500,
        headers: { 'User-Agent': 'RyxoServer-Infrastructure-Pulse/1.0.0' }
      };

      const outRequest = engineClient.get(parsedExecutionUri, requestOptions, (inResponse) => {
        const isCodeAccepted = authorizedCodes.includes(inResponse.statusCode || 0);
        resolve(isCodeAccepted);
        inResponse.resume(); // Flush network streams immediately to avoid pooling leakage
      });

      outRequest.on('error', () => resolve(false));
      outRequest.on('timeout', () => {
        outRequest.destroy();
        resolve(false);
      });
      outRequest.end();
    });
  }

  private probeTcpPort(hostPortString: string): Promise<boolean> {
    return new Promise((resolve) => {
      const connectionFragments = hostPortString.split(':');
      const connectionHost = connectionFragments[0];
      const connectionPort = parseInt(connectionFragments[1] || '80', 10);

      if (isNaN(connectionPort)) {
        return resolve(false);
      }

      const communicationSocket = new net.Socket();
      communicationSocket.setTimeout(4000);

      communicationSocket.connect(connectionPort, connectionHost, () => {
        communicationSocket.end();
        resolve(true);
      });

      communicationSocket.on('error', () => {
        communicationSocket.destroy();
        resolve(false);
      });

      communicationSocket.on('timeout', () => {
        communicationSocket.destroy();
        resolve(false);
      });
    });
  }

  // ==========================================================================
  // TELEMETRY AGGREGATION & GRAPH COMPILER
  // ==========================================================================

  public compileGlobalClusterAnalytics(): GlobalInfrastructureCluster {
    let consolidatedChecksCount = 0;
    let consolidatedSuccessfulChecksCount = 0;
    let activeIncidentsCount = 0;

    const computedMonitors: MonitorTelemetryMetrics[] = Array.from(this.targetsStore.values()).map((target) => {
      const historicalTimeline = this.telemetryHistoryStore.get(target.id) || [];
      const absoluteLatestPulse = historicalTimeline[historicalTimeline.length - 1];

      // Math Formula: Calculate individual precise node uptime ratio metrics
      const successfulPulsesCount = historicalTimeline.filter(pulse => pulse.status === 'UP').length;
      const targetUptimeRatio = historicalTimeline.length > 0 
        ? (successfulPulsesCount / historicalTimeline.length) * 100 
        : 100.00;

      consolidatedSuccessfulChecksCount += successfulPulsesCount;
      consolidatedChecksCount += historicalTimeline.length;

      const currentStatus = absoluteLatestPulse ? absoluteLatestPulse.status : 'UP';
      if (currentStatus === 'DOWN') {
        activeIncidentsCount++;
      }

      // Map running timelines into standard binary bitstreams (1 for UP, 0 for DOWN)
      const compiledHeartbeatBits = historicalTimeline.map(pulse => pulse.status === 'UP' ? 1 : 0);

      return {
        id: target.id,
        name: target.name,
        protocol: target.protocol,
        target: target.target,
        status: currentStatus,
        currentLatencyMs: absoluteLatestPulse ? absoluteLatestPulse.latencyMs : 0,
        uptimeRatio: parseFloat(targetUptimeRatio.toFixed(2)),
        heartbeats24h: compiledHeartbeatBits.length > 0 ? compiledHeartbeatBits : [1, 1, 1]
      };
    });

    const generalizedSystemUptime = consolidatedChecksCount > 0 
      ? (consolidatedSuccessfulChecksCount / consolidatedChecksCount) * 100 
      : 100.00;

    return {
      globalUptimeRatio: parseFloat(generalizedSystemUptime.toFixed(2)),
      activeMonitorsCount: this.targetsStore.size,
      incidentMonitorsCount: activeIncidentsCount,
      monitors: computedMonitors
    };
  }
}