import { PerformanceMetric, PerformancePlugin } from "../core/types";
import { BasePlugin } from "./BasePlugin";

export class ConsoleLoggerPlugin extends BasePlugin implements PerformancePlugin {
  name = 'ConsoleLogger';

  beforeRecord(metric: PerformanceMetric) {
    this.log('info', `Pre-processing metric: ${metric.name}`);
    return metric;
  }

  afterRecord(metric: PerformanceMetric) {
    this.log('info', `Recorded metric: ${metric.name}`, metric);
  }
}

