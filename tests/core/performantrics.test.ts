import { BasePlugin, ConsoleLoggerPlugin, PerformanceMetric, Performantrics } from "../../src";

jest.mock('uuid', () => ({
  v4: () => 'test-uuid'
}));

const mockConsole = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};
global.console = { ...global.console, ...mockConsole };

global.fetch = jest.fn();

class TestMetricTransformerPlugin extends BasePlugin {
  name = 'TestMetricTransformer';

  beforeRecord(metric: PerformanceMetric) {
    return {
      ...metric,
      value: metric.value * 2, // Double the metric value
      metadata: {
        ...metric.metadata,
        transformed: true,
      },
    };
  }

  afterRecord(metric: PerformanceMetric) {
    this.log('info', `Processed metric: ${metric.name}`);
  }
}

describe('Performantrics SDK', () => {
  let sdk: Performantrics;
  
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset performance entries
    // performance.clearMarks();
    // performance.clearMeasures();
  });

  describe('Constructor & Configuration', () => {
    it('should initialize with default config', () => {
      sdk = new Performantrics();
      expect(sdk.getMetrics()).toEqual([]);
    });

    it('should initialize with custom config', () => {
      sdk = new Performantrics({
        debugMode: true,
        sampleRate: 0.5,
        maxMetricsBuffer: 50,
        disabledMetrics: ['paint'],
      });
      expect(sdk.getMetrics()).toEqual([]);
    });
  });

  describe('Plugin System', () => {
    let consoleLogger: ConsoleLoggerPlugin;
    let testTransformer: TestMetricTransformerPlugin;

    beforeEach(() => {
      sdk = new Performantrics({ debugMode: true });
      consoleLogger = new ConsoleLoggerPlugin();
      testTransformer = new TestMetricTransformerPlugin();
    });

    it('should properly register plugins', () => {
      sdk.use(consoleLogger).use(testTransformer);
      const testMetric = {
        name: 'test-metric',
        value: 100,
        category: 'custom' as const,
      };
      
      sdk.recordMetric(testMetric);
      
      // Verify console logger called
      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining('[ConsoleLogger]'),
        expect.stringContaining('Recorded metric: test-metric'),
        expect.any(Object)
      );

      // Verify metric transformation
      const recordedMetrics = sdk.getMetrics();
      expect(recordedMetrics[0]).toMatchObject({
        name: 'test-metric',
        value: 200, // Double the original value
        metadata: {
          transformed: true,
        },
      });
    });
  });

  describe('Metric Recording', () => {
    beforeEach(() => {
      sdk = new Performantrics({
        debugMode: true,
        endpoint: 'https://api.example.com/metrics',
      });
    });

    it('should record and store metrics', () => {
      const testMetric = {
        name: 'test-metric',
        value: 100,
        category: 'custom' as const,
      };

      sdk.recordMetric(testMetric);
      
      const metrics = sdk.getMetrics();
      expect(metrics).toHaveLength(1);
      expect(metrics[0]).toMatchObject({
        ...testMetric,
        id: 'test-uuid',
        timestamp: expect.any(Number),
      });
    });

    it('should respect maxMetricsBuffer limit', () => {
      sdk = new Performantrics({ maxMetricsBuffer: 2 });
      
      for (let i = 0; i < 3; i++) {
        sdk.recordMetric({
          name: `metric-${i}`,
          value: i,
          category: 'custom',
        });
      }

      const metrics = sdk.getMetrics();
      expect(metrics).toHaveLength(2);
      expect(metrics[0].name).toBe('metric-1');
      expect(metrics[1].name).toBe('metric-2');
    });

    it('should transmit metrics when endpoint is configured', () => {
      const testMetric = {
        name: 'test-metric',
        value: 100,
        category: 'custom' as const,
      };

      sdk.recordMetric(testMetric);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/metrics',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })
      );
    });
  });

  // describe('Custom Measurements', () => {
  //   beforeEach(() => {
  //     sdk = new Performantrics();
  //   });

  //   it('should handle custom measure start and end', () => {
  //     const measureName = 'test-measure';
  //     const metadata = { test: true };

  //     sdk.startCustomMeasure(measureName, metadata);
  //     sdk.endCustomMeasure(measureName, metadata);

  //     const metrics = sdk.getMetrics();
  //     expect(metrics).toHaveLength(2); // Start and end measurements
  //     expect(metrics[0].name).toBe(`${measureName}-start`);
  //     expect(metrics[1].name).toBe(measureName);
  //     expect(metrics[1].category).toBe('custom');
  //     expect(metrics[1].value).toBeGreaterThanOrEqual(0);
  //   });

  //   it('should throw error when ending non-existent measure', () => {
  //     expect(() => {
  //       sdk.endCustomMeasure('non-existent');
  //     }).toThrow();
  //   });
  // });

  describe('Error Tracking', () => {
    beforeEach(() => {
      sdk = new Performantrics({ debugMode: true });
    });

    it('should track error events', () => {
      const errorEvent = new ErrorEvent('error', {
        error: new Error('Test error'),
        message: 'Test error message',
      });

      window.dispatchEvent(errorEvent);

      sdk.getMetrics();
      expect(mockConsole.error).toHaveBeenCalledWith(
        'Tracked Error:',
        expect.objectContaining({
          message: 'Test error message',
          timestamp: expect.any(Number),
        })
      );
    });

    // it('should track unhandled promise rejections', () => {
    //   const promiseRejectionEvent = new PromiseRejectionEvent('unhandledrejection', {
    //     promise: Promise.reject(new Error('Test rejection')),
    //     reason: new Error('Test rejection'),
    //   });

    //   window.dispatchEvent(promiseRejectionEvent);
  

    //   expect(mockConsole.error).toHaveBeenCalledWith(
    //     'Tracked Error:',
    //     expect.objectContaining({
    //       message: 'Test rejection',
    //       timestamp: expect.any(Number),
    //     })
    //   );
    // });
  });

  describe('Cleanup', () => {
    beforeEach(() => {
      sdk = new Performantrics();
    });

    it('should clear metrics', () => {
      sdk.recordMetric({
        name: 'test-metric',
        value: 100,
        category: 'custom',
      });

      expect(sdk.getMetrics()).toHaveLength(1);
      
      sdk.clearMetrics();
      expect(sdk.getMetrics()).toHaveLength(0);
    });

    it('should properly destroy instance', () => {
      const disconnectSpy = jest.fn();
      const mockObserver = {
        disconnect: disconnectSpy,
        observe: jest.fn(),
        takeRecords: jest.fn(),
      };

      sdk['observers'].set('test', mockObserver);

      sdk.destroy();

      expect(disconnectSpy).toHaveBeenCalled();
      expect(sdk.getMetrics()).toHaveLength(0);
    });
  });
});