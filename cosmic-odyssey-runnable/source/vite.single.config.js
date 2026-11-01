// Optional: bundles everything into ONE html file (dist/index.html) for easy hosting/preview.
import { viteSingleFile } from 'vite-plugin-singlefile'
export default { base: './', plugins: [viteSingleFile()], build: { chunkSizeWarningLimit: 2000 } }
