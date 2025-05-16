// instagram.com/noureddine_ouafy

const handler = async (m, { conn, text }) => {
  let [ left, right ] = text.split('|')
  if (!left) left = ''
  if (!right) right = ''
  conn.reply(m.chat, left + readMore + right, m)
}

handler.help = ['readmore']
handler.tags = ['tools']
handler.command = /^(readmore)$/i
handler.owner = false
handler.limit = true 
handler.fail = null
export default handler
const more = String.fromCharCode(8206)
const readMore = more.repeat(4001)
