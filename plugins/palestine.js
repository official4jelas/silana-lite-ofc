// https://whatsapp.com/channel/0029VaX4b6J7DAWqt3Hhu01A

import fetch from 'node-fetch'
import uploadImage from '../lib/uploadImage.js'

let handler = async (m, { conn }) => {
  let q = m.quoted ? m.quoted : m
  let mime = (q.msg || q).mimetype || ''
  if (!mime.startsWith('image/')) return m.reply('Please reply to an image.')

  m.reply('Please wait while the image is being processed...\ninstagram.com/noureddine_ouafy')

  let media = await q.download()
  let imageUrl = await uploadImage(media).catch(() => null)
  if (!imageUrl) return m.reply('Failed to upload the image.')

  let apiUrl = `https://api.malik-jmk.web.id/api/maker/profile/v1?flagId=ps&profileUrl=${encodeURIComponent(imageUrl)}`
  let res = await fetch(apiUrl)
  if (!res.ok) return m.reply('Failed to get a response from the API.')

  let buffer = await res.buffer()
  conn.sendFile(m.chat, buffer, 'palestine.jpg', 'Here is your Palestine profile image.\ninstagram.com/noureddine_ouafy', m, false, { mimetype: 'image/jpeg' })
}

handler.help = ['palestine']
handler.tags = ['tools']
handler.command = ['palestine']
handler.limit = true
export default handler
