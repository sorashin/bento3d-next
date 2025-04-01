import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import wasm from 'vite-plugin-wasm'
import topLevelAwait from 'vite-plugin-top-level-await'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    wasm(),
    topLevelAwait()
  ],
  optimizeDeps: {
    exclude: ['nodi-modular']
  },
  resolve: {
		alias: {
			'@': '/src',
		},
	},
})
