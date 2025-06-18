
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { withLovable } from './lib/lovable';

createRoot(document.getElementById("root")!).render(
  withLovable(<App />)
);
