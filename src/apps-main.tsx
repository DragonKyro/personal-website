// Global styles first so component styles can override them.
import './styles/global.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AppsPage } from './pages/AppsPage';
import { Shell } from './shell/Shell';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Shell>
      <AppsPage />
    </Shell>
  </StrictMode>,
);
