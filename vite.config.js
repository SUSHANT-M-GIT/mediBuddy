import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import labelHandler from './api/label.js'

// Runs the same /api/label handler used in production (Vercel function) during
// `vite dev` / `vite preview`, so the app talks to the same interface locally.
function apiMiddleware(server) {
  server.middlewares.use((req, res, next) => {
    if (req.url && req.url.startsWith('/api/label')) {
      labelHandler(req, res)
    } else {
      next()
    }
  })
}

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'api-label-dev-middleware',
      configureServer: apiMiddleware,
      configurePreviewServer: apiMiddleware,
    },
    VitePWA({
      // Seamless updates without prompting the user.
      registerType: 'autoUpdate',
      // Injects the service-worker registration automatically (no main.jsx change).
      injectRegister: 'auto',
      includeAssets: ['icon.svg', 'favicon-32.png', 'apple-touch-icon.png'],
      manifest: {
        name: 'MediBuddy',
        short_name: 'MediBuddy',
        description: 'Search medicines by brand name and get detailed FDA drug label information.',
        theme_color: '#1a73e8',
        background_color: '#f5f7ff',
        display: 'standalone',
        orientation: 'any',
        start_url: '/',
        scope: '/',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        // Cache the API proxy responses client-side too. Combined with the edge
        // cache in api/label.js, this means repeated/seen searches load instantly
        // and work offline, with minimal load on the FDA API.
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname === '/api/label',
            handler: 'StaleWhileRevalidate',
            method: 'GET',
            options: {
              cacheName: 'medibuddy-api-cache',
              expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 },
              cacheableResponse: { statuses: [0, 200, 404] },
            },
          },
        ],
      },
    }),
  ],
})
