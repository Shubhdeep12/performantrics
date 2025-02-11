import { PerformanceMetric } from '../core/types';

export abstract class BasePlugin {
  abstract readonly name: string;

  beforeRecord?(metric: PerformanceMetric): PerformanceMetric | void {
    return metric;
  }

  afterRecord?(metric: PerformanceMetric): PerformanceMetric | void {
    return metric
  }

  protected log(level: 'debug' | 'info' | 'warn' | 'error', message: string, data?: any) {
    const timestamp = new Date().toISOString();
    const prefix = `[${this.name}][${level.toUpperCase()}][${timestamp}]`;
    
    switch (level) {
      case 'debug':
        console.debug(prefix, message, data);
        break;
      case 'info':
        console.info(prefix, message, data);
        break;
      case 'warn':
        console.warn(prefix, message, data);
        break;
      case 'error':
        console.error(prefix, message, data);
        break;
    }
  }
}