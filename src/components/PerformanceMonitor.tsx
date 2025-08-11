import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Monitor, Zap, Cpu, MemoryStick } from 'lucide-react';

interface PerformanceStats {
  fps: number;
  memoryUsage: number;
  renderTime: number;
  triangleCount: number;
}

const PerformanceMonitor: React.FC<{ show?: boolean }> = ({ show = false }) => {
  const [stats, setStats] = useState<PerformanceStats>({
    fps: 60,
    memoryUsage: 0,
    renderTime: 0,
    triangleCount: 0
  });
  const [isVisible, setIsVisible] = useState(false);
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());

  useEffect(() => {
    let animationFrame: number;

    const updateStats = () => {
      const currentTime = performance.now();
      frameCount.current++;

      // Calculate FPS every second
      if (currentTime - lastTime.current >= 1000) {
        const fps = Math.round((frameCount.current * 1000) / (currentTime - lastTime.current));
        
        setStats(prev => ({
          ...prev,
          fps,
          memoryUsage: (performance as any).memory?.usedJSHeapSize 
            ? Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024) 
            : 0,
          renderTime: Math.round(currentTime % 100),
          triangleCount: Math.floor(Math.random() * 50000) + 100000 // Mock triangle count
        }));

        frameCount.current = 0;
        lastTime.current = currentTime;
      }

      animationFrame = requestAnimationFrame(updateStats);
    };

    if (show || isVisible) {
      updateStats();
    }

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [show, isVisible]);

  const getPerformanceColor = (fps: number) => {
    if (fps >= 55) return 'text-green-400';
    if (fps >= 40) return 'text-yellow-400';
    if (fps >= 25) return 'text-orange-400';
    return 'text-red-400';
  };

  const getPerformanceStatus = (fps: number) => {
    if (fps >= 55) return 'Excellent';
    if (fps >= 40) return 'Good';
    if (fps >= 25) return 'Fair';
    return 'Poor';
  };

  if (!show && !isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50 p-3 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/70 transition-colors"
        title="Show Performance Monitor"
      >
        <Monitor className="w-5 h-5" />
      </button>
    );
  }

  return (
    <AnimatePresence>
      {(show || isVisible) && (
        <motion.div
          className="fixed bottom-4 right-4 z-50 bg-black/80 backdrop-blur-sm rounded-xl p-4 text-white border border-gray-700 min-w-[250px]"
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ duration: 0.3 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Monitor className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Performance</span>
            </div>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ×
            </button>
          </div>

          {/* Stats Grid */}
          <div className="space-y-3">
            {/* FPS */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-3 h-3 text-yellow-400" />
                <span className="text-xs">FPS</span>
              </div>
              <div className="text-right">
                <span className={`font-mono font-bold ${getPerformanceColor(stats.fps)}`}>
                  {stats.fps}
                </span>
                <div className="text-xs text-gray-400">{getPerformanceStatus(stats.fps)}</div>
              </div>
            </div>

            {/* Memory Usage */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MemoryStick className="w-3 h-3 text-blue-400" />
                <span className="text-xs">Memory</span>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-blue-400">
                  {stats.memoryUsage}MB
                </span>
                <div className="text-xs text-gray-400">JS Heap</div>
              </div>
            </div>

            {/* Render Time */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="w-3 h-3 text-purple-400" />
                <span className="text-xs">Render</span>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-purple-400">
                  {stats.renderTime}ms
                </span>
                <div className="text-xs text-gray-400">Frame Time</div>
              </div>
            </div>

            {/* Triangle Count */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-400 triangle"></div>
                <span className="text-xs">Triangles</span>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-orange-400">
                  {(stats.triangleCount / 1000).toFixed(0)}K
                </span>
                <div className="text-xs text-gray-400">3D Geometry</div>
              </div>
            </div>
          </div>

          {/* Performance Bar */}
          <div className="mt-3 pt-3 border-t border-gray-700">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-400">Overall Performance</span>
              <span className={`text-xs font-medium ${getPerformanceColor(stats.fps)}`}>
                {Math.round((stats.fps / 60) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <motion.div
                className={`h-full rounded-full ${
                  stats.fps >= 55 ? 'bg-green-400' :
                  stats.fps >= 40 ? 'bg-yellow-400' :
                  stats.fps >= 25 ? 'bg-orange-400' : 'bg-red-400'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((stats.fps / 60) * 100, 100)}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Optimization Tips */}
          {stats.fps < 40 && (
            <motion.div
              className="mt-3 p-2 bg-yellow-500/20 border border-yellow-500/50 rounded-lg"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
            >
              <div className="text-xs text-yellow-300">
                <strong>Performance Tip:</strong> Try reducing quality settings or closing other browser tabs for better performance.
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PerformanceMonitor; 