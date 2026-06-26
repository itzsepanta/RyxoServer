export type MonitorProtocol = 'HTTP' | 'HTTPS' | 'TCP' | 'UDP';
export type MonitorStatus = 'UP' | 'DOWN';

export interface MonitorTarget {
  id: string;
  name: string;
  protocol: MonitorProtocol;
  target: string;          // Maps domain, raw IP, or host:port binds (e.g., "127.0.0.1:25565")
  interval: number;        // Automated polling frequency configured in seconds
  isActive: boolean;
  acceptedCodes?: number[]; // Custom target ranges (e.g., [200, 201, 302])
  createdAt: Date;
  lastCheckedAt?: Date;
}

export interface HeartbeatPulse {
  status: MonitorStatus;
  latencyMs: number;
  timestamp: Date;
  errorMessage?: string;
}

export interface MonitorTelemetryMetrics {
  id: string;
  name: string;
  protocol: MonitorProtocol;
  target: string;
  status: MonitorStatus;
  currentLatencyMs: number;
  uptimeRatio: number;      // Exact floating calculation mapping standard uptimes
  heartbeats24h: number[];  // Binary bit array sequence (1 = UP, 0 = DOWN) for custom status rendering
}

export interface GlobalInfrastructureCluster {
  globalUptimeRatio: number;
  activeMonitorsCount: number;
  incidentMonitorsCount: number;
  monitors: MonitorTelemetryMetrics[];
}