/* eslint-disable no-console */
import { PerformanceMetricsSdk } from '../../src/core/performanceMetricsSdk';
import { ConsoleLoggerPlugin } from '../../src/plugins/ConsoleLoggerPlugin';
import { PerformanceMetric, PerformancePlugin } from '../../src/core/types';
import { PerformanceMetricError, ErrorCodes } from '../../src/core/errors';

jest.mock('uuid', () => ({
  v4: () => 'test-uuid'
}));

class TestPlugin implements PerformancePlugin {
  name = 'TestPlugin';
  beforeRecordCalls: PerformanceMetric[] = [];
  afterRecordCalls: PerformanceMetric[] = [];

  beforeRecord(metric: PerformanceMetric) {
    this.beforeRecordCalls.push(metric);
    return {
      ...metric,
      metadata: { ...metric.metadata, testPlugin: true }
    };
  }

  afterRecord(metric: PerformanceMetric) {
    this.afterRecordCalls.push(metric);
  }
}

describe('PerformanceMetricsSdk', () => {
  let sdk: PerformanceMetricsSdk;
  let consolePlugin: ConsoleLoggerPlugin;
  let testPlugin: TestPlugin;

  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
    
    sdk = new PerformanceMetricsSdk({
      projectId: 'test-project',
      debugMode: true
    });
    
    consolePlugin = new ConsoleLoggerPlugin();
    testPlugin = new TestPlugin();
  });

  afterEach(() => {
    sdk.destroy();
    jest.clearAllMocks();
  });

  describe('Plugin System', () => {
    it('should handle multiple plugins', () => {
      sdk.use(consolePlugin).use(testPlugin);

      sdk.recordMetric({
        name: 'test-metric',
        value: 100,
        category: 'custom'
      });

      expect(testPlugin.beforeRecordCalls).toHaveLength(1);
      expect(testPlugin.afterRecordCalls).toHaveLength(1);
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Pre-processing metric: test-metric')
      );
    });

    it('should throw on invalid plugin', () => {
      const invalidPlugin = { beforeRecord: jest.fn() };
      
      expect(() => {
        sdk.use(invalidPlugin as any);
      }).toThrow(PerformanceMetricError);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid metrics', () => {
      expect(() => {
        sdk.recordMetric({ name: 'test' } as any);
      }).toThrow(new PerformanceMetricError(
        'Invalid metric format. Required: name (string) and value (number)',
        ErrorCodes.INVALID_METRIC
      ));
    });

    it('should handle transmission errors', async () => {
      const errorSpy = jest.spyOn(console, 'error');
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

      sdk = new PerformanceMetricsSdk({
        endpoint: 'http://test-endpoint'
      });

      sdk.recordMetric({
        name: 'test-metric',
        value: 100,
        category: 'custom'
      });

      await new Promise(resolve => setTimeout(resolve, 0));
      expect(errorSpy).toHaveBeenCalledWith(
        'Metrics transmission failed',
        expect.any(Error)
      );
    });
  });

  describe('Custom Measurements', () => {
    it('should handle missing performance marks', () => {
      sdk.startCustomMeasure('test-operation');
      performance.clearMarks();

      expect(() => {
        sdk.endCustomMeasure('test-operation');
      }).toThrow(PerformanceMetricError);
    });
  });
});