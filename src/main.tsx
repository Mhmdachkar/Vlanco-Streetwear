import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './utils/consoleOptimizer.ts' // Import console optimizer for better performance

createRoot(document.getElementById("root")!).render(<App />);
