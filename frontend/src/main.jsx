import React from 'react'
import ReactDOM from 'react-dom/client'
import * as Sentry from "@sentry/react";
import App from './App.jsx'
import './index.css'

Sentry.init({
  dsn: "https://4b4c120a7116a529a763f0f7ab8fb3ee@o4512297762619392.ingest.us.sentry.io/4512415322996736",
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  // Trazas y Replay para producción/demo TP09
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)