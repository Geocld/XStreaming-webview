import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import legacy from '@vitejs/plugin-legacy'
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill'

export default defineConfig({
  base: './',
  plugins: [
    react(),
    legacy({
      targets: ['defaults', 'not IE 11'],
    }),
  ],
  resolve: {
    alias: {
      events: 'rollup-plugin-node-polyfills/polyfills/events',
    }
  },
  optimizeDeps: {
    esbuildOptions: {
        // Node.js global to browser globalThis
        define: {
            global: 'globalThis'
        },
        // Enable esbuild polyfill plugins
        plugins: [
            NodeGlobalsPolyfillPlugin({
                process: true,
                buffer: true
            }),
            NodeModulesPolyfillPlugin()
        ]
    }
  },
  // build: {
  //     rollupOptions: {
  //         plugins: [
  //           rollupNodePolyFill()
  //         ]
  //     }
  // }
})
