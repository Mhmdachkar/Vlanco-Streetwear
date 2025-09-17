import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  renderTime: number;
  isLowEnd: boolean;
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
    isLowEnd: false
  });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    let frameCount = 0;
    let lastTime = performance.now();
    let rafId: number;

    const measurePerformance = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        
        // Get memory usage if available
        let memoryUsage = 0;
        if ('memory' in performance) {
          const memory = (performance as any).memory;
          memoryUsage = Math.round(memory.usedJSHeapSize / 1024 / 1024); // MB
        }

        // Detect low-end device
        const isLowEnd = (() => {
          try {
            const dm = (navigator as any).deviceMemory;
            const hc = (navigator as any).hardwareConcurrency;
            return (typeof dm === 'number' && dm <= 4) || 
                   (typeof hc === 'number' && hc <= 4) ||
                   /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
          } catch {
            return false;
          }
        })();

        const newMetrics: PerformanceMetrics = {
          fps,
          memoryUsage,
          renderTime: currentTime - lastTime,
          isLowEnd
        };

        setMetrics(newMetrics);
        onMetricsUpdate?.(newMetrics);

        frameCount = 0;
        lastTime = currentTime;
      }

      rafId = requestAnimationFrame(measurePerformance);
    };

    rafId = requestAnimationFrame(measurePerformance);

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [enabled, onMetricsUpdate]);

  // Toggle visibility with keyboard shortcut
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        setIsVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  if (!enabled || !isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className="fixed top-4 right-4 z-50 bg-black/90 backdrop-blur-sm border border-slate-700 rounded-lg p-4 text-white text-sm font-mono"
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-cyan-400">Performance Monitor</h3>
          <button
            onClick={() => setIsVisible(false)}
            className="text-slate-400 hover:text-white transition-colors"
          >
            ×
          </button>
        </div>
        
        <div className="space-y-1">
          <div className="flex justify-between">
            <span>FPS:</span>
            <span className={metrics.fps >= 50 ? 'text-green-400' : metrics.fps >= 30 ? 'text-yellow-400' : 'text-red-400'}>
              {metrics.fps}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span>Memory:</span>
            <span className={metrics.memoryUsage < 100 ? 'text-green-400' : metrics.memoryUsage < 200 ? 'text-yellow-400' : 'text-red-400'}>
              {metrics.memoryUsage}MB
            </span>
          </div>
          
          <div className="flex justify-between">
            <span>Device:</span>
            <span className={metrics.isLowEnd ? 'text-yellow-400' : 'text-green-400'}>
              {metrics.isLowEnd ? 'Low-end' : 'High-end'}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span>Render:</span>
            <span className={metrics.renderTime < 16 ? 'text-green-400' : 'text-yellow-400'}>
              {metrics.renderTime.toFixed(1)}ms
            </span>
          </div>
        </div>
        
        <div className="mt-2 pt-2 border-t border-slate-700 text-xs text-slate-400">
          Press Ctrl+Shift+P to toggle
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PerformanceMonitor;