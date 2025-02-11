/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
import { v4 as uuidv4 } from "uuid";
import {
  PerformanceConfig,
  PerformanceError,
  PerformanceMetric,
  PerformancePlugin,
} from "./types";
import { checkBrowserCompatibility } from "../utils/browserCompatibility";
import {
  validateMetric,
  validatePlugin,
  PerformanceMetricError,
  ErrorCodes,
} from "./errors";

export class Performantrics {
  private config: PerformanceConfig;
  private metrics: PerformanceMetric[] = [];
  private errors: PerformanceError[] = [];
  private observers: Map<string, PerformanceObserver> = new Map();
  private sessionId: string;
  private plugins: PerformancePlugin[] = [];

  constructor(config: PerformanceConfig = {}) {
    if (!checkBrowserCompatibility()) {
      console.warn("Browser does not fully support Performance SDK");
    }

    this.config = {
      debugMode: false,
      sampleRate: 1.0,
      maxMetricsBuffer: 100,
      disabledMetrics: [],
      ...config,
    };

    this.sessionId = uuidv4();
    this.initializeErrorTracking();
    this.initializePerformanceObservers();
  }

  public use(plugin: PerformancePlugin) {
    validatePlugin(plugin);
    this.plugins.push(plugin);
    return this;
  }

  private initializeErrorTracking() {
    window.addEventListener("error", (event) => {
      this.trackError({
        message: event.message,
        stack: event.error?.stack,
      });
    });

    window.addEventListener("unhandledrejection", (event) => {
      this.trackError({
        message: event.reason?.message || "Unhandled Promise Rejection",
        stack: event.reason?.stack,
      });
    });
  }

  private initializePerformanceObservers() {
    const observerTypes = [
      { type: "paint", buffered: true },
      { type: "measure", buffered: true },
      { type: "navigation", buffered: true },
      { type: "resource", buffered: true },
    ];

    observerTypes.forEach(({ type, buffered }) => {
      if (this.config.disabledMetrics?.includes(type)) return;

      try {
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            this.recordMetric({
              name: entry.name,
              value: entry.duration,
              category: type as any,
              metadata: {
                entryType: entry.entryType,
                startTime: entry.startTime,
              },
            });
          });
        });

        observer.observe({ type, buffered });
        this.observers.set(type, observer);
      } catch (error: any) {
        this.trackError({
          message: `Failed to initialize observer for type: ${type}`,
          stack: error.stack,
        });
      }
    });
  }

  public recordMetric(metric: Omit<PerformanceMetric, "id" | "timestamp">) {
    validateMetric(metric);

    if (Math.random() > (this.config.sampleRate ?? 0)) return;

    const fullMetric: PerformanceMetric = {
      id: uuidv4(),
      timestamp: Date.now(),
      ...metric,
    };

    let processedMetric = fullMetric;
    for (const plugin of this.plugins) {
      const result = plugin.beforeRecord?.(processedMetric);
      if (result) processedMetric = result;
    }

    this.metrics.push(processedMetric);

    if (this.metrics.length > (this.config.maxMetricsBuffer ?? 0)) {
      this.metrics.shift();
    }

    if (this.config.debugMode) {
      console.log("Performance Metric:", processedMetric);
    }

    this.plugins.forEach((plugin) => plugin.afterRecord?.(processedMetric));

    this.maybeTransmitMetrics();
  }

  public trackError(error: Omit<PerformanceError, "timestamp">) {
    const fullError: PerformanceError = {
      ...error,
      timestamp: Date.now(),
    };

    this.errors.push(fullError);

    if (this.config.debugMode) {
      console.error("Tracked Error:", fullError);
    }
  }

  private maybeTransmitMetrics() {
    if (!this.config.endpoint) return;

    try {
      fetch(this.config.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId: this.sessionId,
          projectId: this.config.projectId,
          metrics: this.metrics,
          errors: this.errors,
        }),
      });
    } catch (error: any) {
      this.trackError({
        message: "Metrics transmission failed",
        stack: error.stack,
      });
    }
  }

  // Advanced Measurement Methods
  public startCustomMeasure(name: string, metadata?: Record<string, any>) {
    performance.mark(`${name}-start`);
    this.recordMetric({
      name: `${name}-start`,
      value: performance.now(),
      category: "custom",
      metadata,
    });
  }

  public endCustomMeasure(name: string, metadata?: Record<string, any>) {
    try {
      performance.mark(`${name}-end`);
      performance.measure(name, `${name}-start`, `${name}-end`);
    } catch (error) {
      throw new PerformanceMetricError(
        `Failed to end measure: ${name}`,
        ErrorCodes.MEASURE_NOT_FOUND
      );
    }

    const measure = performance.getEntriesByName(name)[0];
    this.recordMetric({
      name,
      value: measure.duration,
      category: "custom",
      metadata,
    });
  }

  // Management Methods
  public getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  public clearMetrics() {
    this.metrics = [];
    this.errors = [];
  }

  public destroy() {
    this.observers.forEach((observer) => observer.disconnect());
    this.observers.clear();
    this.clearMetrics();
  }
}
