import '@/index.css'

import { createRoot } from 'react-dom/client'

import App from '@/app'

const domRoot = document.getElementById('root')
if (domRoot) {
  createRoot(domRoot).render(<App />)
}
