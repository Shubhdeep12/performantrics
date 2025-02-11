# How to create and use Custom Plugin

```typescript
import { BasePlugin, PerformanceMetric } from "performance-metrics-sdk";

interface AnalyticsPluginConfig {
  analyticsEndpoint: string;
  batchSize?: number;
}

class AnalyticsPlugin extends BasePlugin {
  readonly name = "Analytics";
  private config: AnalyticsPluginConfig;
  private metricsBatch: PerformanceMetric[] = [];

  constructor(config: AnalyticsPluginConfig) {
    super();
    this.config = {
      batchSize: 10,
      ...config,
    };
  }

  afterRecord(metric: PerformanceMetric): void {
    this.metricsBatch.push(metric);

    if (this.metricsBatch.length >= this.config.batchSize) {
      this.sendToAnalytics();
    }
  }

  private async sendToAnalytics() {
    try {
      await fetch(this.config.analyticsEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(this.metricsBatch),
      });
      this.metricsBatch = [];
      this.log("info", "Metrics batch sent to analytics");
    } catch (error) {
      this.log("error", "Failed to send metrics to analytics", error);
    }
  }
}

// Usage Example:
const sdk = new PerformanceMetricsSdk({
  projectId: "my-project",
  debugMode: true,
});

// Using built-in plugin
sdk.use(
  new MetricsTransformPlugin({
    minValue: 0,
    maxValue: 1000,
    excludeCategories: ["resource"],
    transforms: {
      "page-load": (value) => value / 1000, // Convert to seconds
    },
  })
);

// Using custom plugin
sdk.use(
  new AnalyticsPlugin({
    analyticsEndpoint: "https://analytics.example.com/metrics",
    batchSize: 5,
  })
);
```
