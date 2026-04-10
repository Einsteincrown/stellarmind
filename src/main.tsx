import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Polyfills for Stellar SDK
import { Buffer } from 'buffer';
import process from 'process';

if (typeof window !== 'undefined') {
  // Use a safer assignment that won't trigger "Cannot redefine property"
  if (!(window as any).Buffer) {
    (window as any).Buffer = Buffer;
  }
  if (!(window as any).process) {
    (window as any).process = process;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
