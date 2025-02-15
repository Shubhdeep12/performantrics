<img src="./assets/logo/performantrics-logo.svg" width="100%" height="250px">

# Performance Metrics SDK

## Overview

Performance Metrics SDK is a lightweight, extensible JavaScript library for collecting and analyzing web performance metrics with minimal setup.

## Features

- 🚀 Automatic Performance Tracking
- 🔍 Custom Metric Measurement
- 🔌 Plugin System
- 🛡️ Error Tracking
- 📊 Configurable Metric Collection
- 🌐 Browser Compatibility Checks

## Installation

```bash
npm install performantrics
```

## Quick Start

### Basic Usage

```typescript
import Performantrics from 'performantrics';

// Initialize with basic configuration
const tracker = new Performantrics({
  projectId: 'my-project',
  endpoint: 'https://metrics-collector.com/track',
  debugMode: true
});

// Track custom performance measurement
tracker.startCustomMeasure('login-process');
// ... login logic
tracker.endCustomMeasure('login-process');
```

### Advanced Configuration

```typescript
const tracker = new Performantrics({
  projectId: 'my-project',
  endpoint: 'https://metrics-collector.com/track',
  debugMode: true,
  sampleRate: 0.5, // Only track 50% of metrics
  disabledMetrics: ['resource'], // Disable specific metric types
  sensitiveDataFilter: (metric) => {
    // Remove sensitive metadata
    delete metric.metadata?.sensitiveInfo;
    return metric;
  }
});
```

## Plugin System

### Creating a Custom Plugin

[Custom Plugin Example](./docs/CustomPluginExample.md)

## API Reference

### Constructor Options

| Option | Type | Description | Default |
|--------|------|-------------|---------|
| `projectId` | `string` | Unique identifier for your project | `undefined` |
| `endpoint` | `string` | Metrics collection endpoint | `undefined` |
| `debugMode` | `boolean` | Enable console logging | `false` |
| `sampleRate` | `number` | Percentage of metrics to collect | `1.0` |
| `disabledMetrics` | `string[]` | Metrics types to ignore | `[]` |
| `sensitiveDataFilter` | `Function` | Custom metric filtering | `undefined` |

### Methods

- `startCustomMeasure(name: string, metadata?: object)`: Begin custom performance tracking
- `endCustomMeasure(name: string, metadata?: object)`: End custom performance tracking
- `recordMetric(metric: object)`: Manually record a performance metric
- `getMetrics()`: Retrieve collected metrics
- `clearMetrics()`: Clear all collected metrics
- `use(plugin: PerformancePlugin)`: Add a plugin to the SDK

## Browser Compatibility

The SDK checks for essential browser APIs:
- `PerformanceObserver`
- `performance`
- `fetch`

Incompatible browsers will log warnings but won't break your application.

## Error Tracking

Automatically captures:
- Global `error` events
- Unhandled Promise rejections

## Performance Types Tracked

- Paint metrics
- Navigation metrics
- Resource loading
- Custom measurements
- Long tasks

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit changes
4. Push to the branch
5. Create a Pull Request

## Support

Open an issue on GitHub for bug reports or feature requests.