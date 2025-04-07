import { defineConfig } from 'vite'

export default defineConfig({
    build: {
        outDir: 'dist',
        sourcemap: true,
        rollupOptions: {
            output: {
                manualChunks: {
                    'firebase': ['firebase/app', 'firebase/firestore'],
                    'vendor': ['./src/services/firebase.ts']
                }
            }
        }
    },
    server: {
        port: 5173,
        host: true
    }
}) 