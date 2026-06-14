import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import './utils/apiInterceptor.ts'; // Import API interceptor early for Netlify database fallback compatibility
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Register Service Worker for offline capabilities in remote mountain terrain
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => {
        console.log('[HillyTrip PWA] Service Worker registered in remote hub scope:', reg.scope);
      })
      .catch(err => {
        console.error('[HillyTrip PWA Warning] Service Worker registration rejected:', err);
      });
  });
}

