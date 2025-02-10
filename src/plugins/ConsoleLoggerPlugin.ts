import { PerformanceMetric, PerformancePlugin } from "../core/types";

export class ConsoleLoggerPlugin implements PerformancePlugin {
  name = 'ConsoleLogger';

  beforeRecord(metric: PerformanceMetric) {
    console.log(`Pre-processing metric: ${metric.name}`);
    return metric;
  }

  afterRecord(metric: PerformanceMetric) {
    console.log(`Recorded metric: ${metric.name}`, metric);
  }
}

