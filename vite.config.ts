import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import wasm from 'vite-plugin-wasm'
import svgr from "vite-plugin-svgr";
import topLevelAwait from "vite-plugin-top-level-await";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    wasm(),
    topLevelAwait(),
    svgr({ include: "**/*.svg" })
  ],
  build: {
    target: 'esnext'
  },
  optimizeDeps: {
    exclude: ['nodi-modular', 'manifold-3d']
  },
  resolve: {
		alias: {
			'@': '/src',
		},
	},
})
