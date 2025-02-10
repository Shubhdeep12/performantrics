export { PerformanceMetricsSdk } from './core/performanceMetricsSdk';
export type {
  PerformanceConfig,
  PerformanceError,
  PerformanceMetric,
  PerformancePlugin
} from './core/types';

// Default instance export
import { PerformanceMetricsSdk } from './core/performanceMetricsSdk';
export default new PerformanceMetricsSdk();