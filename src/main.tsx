import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initialize } from '@nucypher/taco';

console.log('Starting app initialization...');

const startApp = async () => {
  try {
    console.log('Initializing Taco...');
    await initialize();
    console.log('Taco initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Taco:', error);
    // Continue with app rendering even if Taco fails to initialize
  }

  try {
    const rootElement = document.getElementById("root");
    if (!rootElement) {
      throw new Error("Root element not found");
    }
    
    createRoot(rootElement).render(<App />);
    console.log('App rendered successfully');
  } catch (error) {
    console.error('Failed to render app:', error);
    // Display error message in the DOM
    document.body.innerHTML = `
      <div style="padding: 20px; color: red;">
        <h1>Error Starting App</h1>
        <pre>${error instanceof Error ? error.message : 'Unknown error'}</pre>
      </div>
    `;
  }
};

startApp();