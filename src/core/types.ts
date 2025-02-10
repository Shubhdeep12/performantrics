
export interface PerformanceConfig {
  projectId?: string;
  endpoint?: string;
  debugMode?: boolean;
  sampleRate?: number;
  disabledMetrics?: string[];
  maxMetricsBuffer?: number;
  sensitiveDataFilter?: (metric: PerformanceMetric) => PerformanceMetric;
}

export interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  timestamp: number;
  category: 'paint' | 'measure' | 'longtask' | 'custom' | 'navigation' | 'resource';
  metadata?: Record<string, any>;
}

export interface PerformanceError {
  message: string;
  stack?: string;
  timestamp: number;
}

export interface PerformancePlugin {
  name: string;
  beforeRecord?(metric: PerformanceMetric): PerformanceMetric | void;
  afterRecord?(metric: PerformanceMetric): void;
}

export class PerformanceMetricError extends Error {
  constructor(message: string) {
    super(`PerformanceMetrics SDK Error: ${message}`);
    this.name = 'PerformanceMetricError';
  }
}