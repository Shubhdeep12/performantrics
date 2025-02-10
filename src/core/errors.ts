export class PerformanceMetricError extends Error {
  constructor(message: string, public code: string) {
    super(`PerformanceMetrics SDK Error: ${message}`);
    this.name = 'PerformanceMetricError';
  }
}

export const ErrorCodes = {
  INVALID_PLUGIN: 'INVALID_PLUGIN',
  BROWSER_INCOMPATIBLE: 'BROWSER_INCOMPATIBLE',
  INVALID_METRIC: 'INVALID_METRIC',
  TRANSMISSION_FAILED: 'TRANSMISSION_FAILED',
  MEASURE_NOT_FOUND: 'MEASURE_NOT_FOUND'
} as const;

export function validateMetric(metric: any) {
  if (!metric.name || typeof metric.value !== 'number') {
    throw new PerformanceMetricError(
      'Invalid metric format. Required: name (string) and value (number)',
      ErrorCodes.INVALID_METRIC
    );
  }
}

export function validatePlugin(plugin: any) {
  if (!plugin.name) {
    throw new PerformanceMetricError(
      'Plugin must have a name property',
      ErrorCodes.INVALID_PLUGIN
    );
  }
}