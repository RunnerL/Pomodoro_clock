import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import MiniWindow from './components/MiniWindow'
import { ErrorBoundary } from './ErrorBoundary'

const isMini = new URLSearchParams(window.location.search).get('mini') === 'true'

const root = document.getElementById('root')
if (root) {
  createRoot(root).render(
    <ErrorBoundary>
      {isMini ? <MiniWindow /> : <App />}
    </ErrorBoundary>
  )
}