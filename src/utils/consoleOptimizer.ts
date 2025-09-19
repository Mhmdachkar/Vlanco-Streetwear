// Console Optimizer - Disable all console logging in production for better performance

// Override console methods to prevent performance issues
if (import.meta.env.PROD) {
  // Disable all console methods in production
  console.log = () => {};
  console.warn = () => {};
  console.error = () => {};
  console.info = () => {};
  console.debug = () => {};
  console.trace = () => {};
  console.table = () => {};
  console.group = () => {};
  console.groupEnd = () => {};
  console.time = () => {};
  console.timeEnd = () => {};
  console.count = () => {};
  console.clear = () => {};
}

// Performance-optimized logging for development only
export const devLog = (message: string, ...args: any[]) => {
  if (import.meta.env.DEV) {
    console.log(message, ...args);
  }
};

export const devWarn = (message: string, ...args: any[]) => {
  if (import.meta.env.DEV) {
    console.warn(message, ...args);
  }
};

export const devError = (message: string, ...args: any[]) => {
  if (import.meta.env.DEV) {
    console.error(message, ...args);
  }
};

// Throttled logging to prevent spam
let logThrottle: { [key: string]: number } = {};

export const throttledLog = (key: string, message: string, ...args: any[]) => {
  const now = Date.now();
  const lastLog = logThrottle[key] || 0;
  
  // Only log once per second per key
  if (now - lastLog > 1000) {
    logThrottle[key] = now;
    if (import.meta.env.DEV) {
      console.log(`[${key}] ${message}`, ...args);
    }
  }
};

// Clear throttled logs periodically
setInterval(() => {
  const now = Date.now();
  Object.keys(logThrottle).forEach(key => {
    if (now - logThrottle[key] > 5000) {
      delete logThrottle[key];
    }
  });
}, 5000);
