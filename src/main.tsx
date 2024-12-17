import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initialize } from '@nucypher/taco';

// Initialize TACo when the app starts
await initialize();

createRoot(document.getElementById("root")!).render(<App />);