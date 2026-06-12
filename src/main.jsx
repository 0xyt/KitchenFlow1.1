import { getRedirectResult } from 'firebase/auth'
import { auth } from './lib/firebase'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'

async function init() {
  if (auth) {
    try {
      const result = await getRedirectResult(auth)
      if (result) {
        console.log('[Init] Redirect result procesado:', result.user.displayName)
      } else {
        console.log('[Init] Sin redirect pendiente')
      }
    } catch (err) {
      console.warn('[Init] Error getRedirectResult:', err.code, err.message)
    }
  }

  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <AuthProvider>
        <App />
      </AuthProvider>
    </StrictMode>,
  )
}

init()
