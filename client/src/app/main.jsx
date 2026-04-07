// client/src/app/main.jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import { FluentProvider } from '@fluentui/react-components';
import { fluentTheme } from './fluentTheme.js';
import { AuthProvider } from '../lib/auth/AuthContext.jsx';
import RouterApp from './RouterApp.jsx';
import '../shared/styles/styles.css';
import '../shared/styles/microinteractions.css';
import '../shared/styles/ui.css';
import '../shared/styles/responsive.css';

const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <FluentProvider theme={fluentTheme}>
      <AuthProvider>
        <RouterApp />
      </AuthProvider>
    </FluentProvider>
  </React.StrictMode>
);
