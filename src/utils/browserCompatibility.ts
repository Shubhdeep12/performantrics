export function checkBrowserCompatibility(): boolean {
  const requiredApis = [
    'PerformanceObserver',
    'performance',
    'fetch'
  ];

  return requiredApis.every(api => 
    typeof window !== 'undefined' && 
    api in window
  );
}