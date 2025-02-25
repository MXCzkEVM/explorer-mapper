import path, { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import pkg from './package.json'

const __dirname = dirname(fileURLToPath(import.meta.url))
// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      constants: path.resolve(__dirname, 'src/source/constants'),
      lib: path.resolve(__dirname, 'src/source/lib'),
    },
  },

  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'MoonchainMapper',
      fileName: 'index',
      formats: ['cjs', 'es'],
    },
    rollupOptions: {
      external: [
        ...Object.keys(pkg.dependencies || {}).map(dep => new RegExp(dep)),
        /react/,
      ],
      output: {
        globals: {
          'react': 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
  },
  plugins: [react()],
})
