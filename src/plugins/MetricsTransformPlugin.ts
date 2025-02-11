import { BasePlugin } from './BasePlugin';
import { PerformanceMetric } from '../core/types';

export interface MetricsTransformConfig {
  minValue?: number;
  maxValue?: number;
  excludeCategories?: string[];
  transforms?: {
    [key: string]: (value: number) => number;
  };
}

export class MetricsTransformPlugin extends BasePlugin {
  readonly name = 'MetricsTransform';
  private config: MetricsTransformConfig;

  constructor(config: MetricsTransformConfig = {}) {
    super();
    this.config = {
      minValue: 0,
      maxValue: Infinity,
      excludeCategories: [],
      transforms: {},
      ...config
    };
  }

  beforeRecord(metric: PerformanceMetric): PerformanceMetric | void {
    if (this.config.excludeCategories?.includes(metric.category)) {
      return;
    }

    let value = metric.value;

    if (this.config.transforms?.[metric.name]) {
      value = this.config.transforms[metric.name]?.(value) ?? value;
    }

    value = Math.min(Math.max(value, this.config.minValue ?? 0), this.config.maxValue ?? Infinity);

    return {
      ...metric,
      value,
      metadata: {
        ...metric.metadata,
        transformed: true,
        originalValue: metric.value
      }
    };
  }
}