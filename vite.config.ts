import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import wasm from 'vite-plugin-wasm'
import svgr from "vite-plugin-svgr";
// import topLevelAwait from 'vite-plugin-top-level-await'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    wasm(),
    svgr({ include: "**/*.svg" })
    // topLevelAwait()
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
