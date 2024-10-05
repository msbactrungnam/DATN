import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import basicSsl from '@vitejs/plugin-basic-ssl'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills(),
  ],
  // server: {
  //   host: '192.168.174.192',
  //   port: 5173,
  //   // https: {
  //   //   key: './src/certs/cert.key',
  //   //   cert: './src/certs/cert.crt',
  //   // },
  //   proxy: {
  //     '/api': {
  //       target: 'http://192.168.174.192:3001/api',
  //       changeOrigin: true,
  //       secure: false,
  //     },
  //   },
  // },

})

