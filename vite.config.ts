import { defineConfig, type ViteDevServer } from 'vite'
import react from '@vitejs/plugin-react'
import garrettAiHandler from './api/garrett-ai'
import garrettAiAdminHandler from './api/garrett-ai-admin'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'garrett-ai-api-middleware',
      configureServer(server: ViteDevServer) {
        server.middlewares.use((req, res, next) => {
          const pathname = (req.url || '').split('?')[0]
          if (pathname === '/api/garrett-ai') {
            void garrettAiHandler(req as any, res as any)
            return
          }
          if (pathname === '/api/garrett-ai-admin') {
            void garrettAiAdminHandler(req as any, res as any)
            return
          }
          next()
        })
      },
    },
  ],
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
})