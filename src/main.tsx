import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './App.tsx'

async function enableMocking() {
  if (!import.meta.env.DEV || import.meta.env.VITE_ENABLE_API_MOCKS !== 'true') {
    return
  }

  const { worker } = await import('./mocks/browser')

  return worker.start({
    onUnhandledRequest: 'bypass',
  }).then(() => {
    console.warn('[ADI_FE] Mock API mode — no real network calls. Use npm run dev (api mode) for backend integration.')
  })
}

enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})
