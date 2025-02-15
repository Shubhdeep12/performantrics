// Polyfill for PromiseRejectionEvent if it's not defined
if (typeof PromiseRejectionEvent === 'undefined') {
  class MockPromiseRejectionEvent extends Event {
    constructor(type, eventInitDict) {
      super(type, eventInitDict);
      this.promise = eventInitDict.promise;
      this.reason = eventInitDict.reason;
    }
  }
  global.PromiseRejectionEvent = MockPromiseRejectionEvent;
}

// Mock the Performance API if not present
if (typeof performance === 'undefined') {
  global.performance = {};
}

if (!performance.mark) {
  performance.mark = jest.fn();
}

if (!performance.measure) {
  performance.measure = jest.fn();
}

if (!performance.now) {
  // You can customize this to return more realistic timestamps if needed.
  performance.now = jest.fn(() => Date.now());
}

if (!performance.clearMarks) {
  performance.clearMarks = jest.fn();
}

if (!performance.clearMeasures) {
  performance.clearMeasures = jest.fn();
}

if (!performance.getEntriesByName) {
  performance.getEntriesByName = jest.fn(() => []);
}
