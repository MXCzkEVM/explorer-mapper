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
    sourcemap: true,
    minify: false,
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'MoonchainMapper',
      fileName: 'index',
      formats: ['cjs', 'es'],
    },
    rollupOptions: {
      external: [
        ...Object.keys(pkg.dependencies || {})
          .filter(dep => dep !== 'react-icons')
          .map(dep => new RegExp(dep)),
        'react',
        'react-dom',
        /react\//,
        /react-dom\//,
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
