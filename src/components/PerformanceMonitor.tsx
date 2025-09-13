import React, { useEffect, useState } from 'react';

interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  renderTime: number;
  isLowEndDevice: boolean;
}

interface PerformanceMonitorProps {
  enabled?: boolean;
  onMetricsUpdate?: (metrics: PerformanceMetrics) => void;
}

const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({ 
  enabled = false, 
  onMetricsUpdate 
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    memoryUsage: 0,
    renderTime: 0,
    isLowEndDevice: false
  });

  useEffect(() => {
    if (!enabled) return;

    let frameCount = 0;
    let lastTime = performance.now();
    let fpsInterval: number;
    let memoryInterval: number;

    const updateFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        
        // Get memory usage if available
        const memoryInfo = (performance as any).memory;
        const memoryUsage = memoryInfo ? 
          Math.round(memoryInfo.usedJSHeapSize / 1024 / 1024) : 0;

        // Detect low-end device
        const isLowEndDevice = 
          (navigator as any).deviceMemory <= 4 ||
          (navigator as any).hardwareConcurrency <= 4 ||
          /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        const newMetrics: PerformanceMetrics = {
          fps,
          memoryUsage,
          renderTime: performance.now(),
          isLowEndDevice
        };

        setMetrics(newMetrics);
        onMetricsUpdate?.(newMetrics);

        frameCount = 0;
        lastTime = currentTime;
      }
      
      fpsInterval = requestAnimationFrame(updateFPS);
    };

    const updateMemory = () => {
      const memoryInfo = (performance as any).memory;
      if (memoryInfo) {
        const memoryUsage = Math.round(memoryInfo.usedJSHeapSize / 1024 / 1024);
        setMetrics(prev => ({ ...prev, memoryUsage }));
      }
    };

    fpsInterval = requestAnimationFrame(updateFPS);
    memoryInterval = setInterval(updateMemory, 1000);

    return () => {
      if (fpsInterval) cancelAnimationFrame(fpsInterval);
      if (memoryInterval) clearInterval(memoryInterval);
    };
  }, [enabled, onMetricsUpdate]);

  // Don't render anything - this is just for monitoring
  return null;
};

export default PerformanceMonitor;
