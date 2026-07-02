import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base '/bonus-tracker/' for GitHub Pages project site; '/' locally for dev
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/bonus-tracker/' : '/',
  plugins: [react()],
  server: { port: 5178, open: true },
}))
