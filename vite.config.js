import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    'import.meta.env.VITE_VIDEO_URL': JSON.stringify('/api/video-url?volume=01&lesson=01&asset=lecture-p01.mp4'),
  },
})
