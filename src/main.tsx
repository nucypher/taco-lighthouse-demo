import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initialize } from '@nucypher/taco';

console.log('Starting app initialization...');

initialize()
  .then(() => {
    console.log('Taco initialized successfully');
    createRoot(document.getElementById("root")!).render(<App />);
  })
  .catch((error) => {
    console.error('Failed to initialize Taco:', error);
    // Still render the app so we can show an error message to the user
    createRoot(document.getElementById("root")!).render(<App />);
  });