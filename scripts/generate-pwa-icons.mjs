// Generates PWA icons (PNG) from public/icon.svg using sharp.
// Run after changing the icon:  node scripts/generate-pwa-icons.mjs
import sharp from 'sharp'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const publicDir = path.resolve(__dirname, '..', 'public')
const svgBuffer = await readFile(path.join(publicDir, 'icon.svg'))

async function generate(name, size) {
  await sharp(svgBuffer, { density: 384 })
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toFile(path.join(publicDir, name))
  console.log(`ok  ${name} (${size}x${size})`)
}

await generate('pwa-192.png', 192)
await generate('pwa-512.png', 512)
await generate('maskable-512.png', 512)
await generate('apple-touch-icon.png', 180)
await generate('favicon-32.png', 32)

console.log('PWA icons generated in /public')
