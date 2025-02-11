export { Performantrics } from "./core/performantrics";
export type {
  PerformanceConfig,
  PerformanceError,
  PerformanceMetric,
  PerformancePlugin,
} from "./core/types";

export { BasePlugin } from './plugins/BasePlugin';
export { ConsoleLoggerPlugin } from './plugins/ConsoleLoggerPlugin';
export { MetricsTransformPlugin } from './plugins/MetricsTransformPlugin';

export type {
  MetricsTransformConfig
} from "./plugins/MetricsTransformPlugin"

// Default instance export
import { Performantrics } from "./core/performantrics";
export default new Performantrics();
