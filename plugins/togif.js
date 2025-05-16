// instagram.com/noureddine_ouafy
import { webp2mp4 } from '../lib/webp2mp4.js'

const handler = async (m, { conn, usedPrefix, command }) => {
  if (!m.quoted) throw `Reply to a sticker with the caption *${usedPrefix + command}*`
  const mime = m.quoted.mimetype || ''
  if (!/webp/.test(mime)) throw `Reply to a sticker with the caption *${usedPrefix + command}*`

  const media = await m.quoted.download()
  let out = Buffer.alloc(0)
  if (/webp/.test(mime)) {
    out = await webp2mp4(media)
  }

  await conn.sendFile(m.chat, out, 'sticker.mp4', wm, m, true, {
    gifPlayback: true,
    gifAttribution: 2
  })
}

handler.help = ['togif']
handler.tags = ['sticker']
handler.command = /^(togif)$/i
handler.limit = true 
export default handler
