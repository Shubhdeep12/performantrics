import { PerformanceMetric } from "../core/types";

export interface PerformancePlugin {
  name: string;
  beforeRecord?(metric: PerformanceMetric): PerformanceMetric | void;
  afterRecord?(metric: PerformanceMetric): void;
}