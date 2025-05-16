let handler = async (m, { conn, usedPrefix, command }) => {
    const notStickerMessage = `✳️ Respond to stickers with :\n\n *${usedPrefix + command}*`
    if (!m.quoted) throw notStickerMessage
    const q = m.quoted || m
    let mime = q.mediaType || ''
    if (/webp/.test(mime)) throw notStickerMessage
    let media = await q.download()
    await conn.sendMessage(m.chat, {image: media, caption: 'S I L A N A _ AI'}, {quoted: m})
}
handler.help = ['toimg']
handler.tags = ['sticker']
handler.command = /^(toimg)$/i
handler.limit = true 
export default handler
