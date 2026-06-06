import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.dirname(fileURLToPath(import.meta.url))

// Keep the same `@/* -> ./*` alias the Next project used so copied imports
// (e.g. `@/components/...`, `@/src/...`, `@/lib/...`, `@/hooks/...`) resolve
// unchanged.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': root,
    },
  },
})
