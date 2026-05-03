import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../index.css'
import { TabBarApp } from './TabBarApp'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TabBarApp />
  </StrictMode>,
)
