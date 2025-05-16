// @noureddine_ouafy

import axios from 'axios'

let handler = async (m, { conn, text }) => {
  if (!text) {
    return m.reply(`*「 DEEP IMAGE GENERATOR 」*

How to use:
.deepimg <prompt> | <style>

Example:
.deepimg City at night | Cyberpunk
.deepimg Beautiful fantasy forest | Fantasy

If <style> is not provided, it will default to *realistic*

Example without style:
.deepimg Sunset over the mountains`)
  }

  let [prompt, style] = text.split('|').map(a => a.trim())
  if (!prompt) return m.reply('Please enter a prompt! Example: .deepimg City | Cyberpunk')

  style = (style || 'realistic').toLowerCase()

  await m.reply('⏳ Please wait, generating image...')

  const deviceId = `dev-${Math.floor(Math.random() * 1000000)}`
  try {
    const response = await axios.post('https://api-preview.chatgot.io/api/v1/deepimg/flux-1-dev', {
      prompt: `${prompt} -style ${style}`,
      size: "1024x1024",
      device_id: deviceId
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://deepimg.ai',
        'Referer': 'https://deepimg.ai/',
      }
    })

    const data = response.data
    if (data?.data?.images?.length > 0) {
      const imageUrl = data.data.images[0].url
      await conn.sendMessage(m.chat, {
        image: { url: imageUrl },
        caption: `✅ Image successfully generated!\n\n*Prompt:* ${prompt}\n*Style:* ${style}`
      }, { quoted: m })
    } else {
      m.reply('❌ Failed to generate image.')
    }
  } catch (err) {
    console.error(err.response ? err.response.data : err.message)
    m.reply('❌ An error occurred while generating the image.')
  }
}

handler.help = ['deepimg']
handler.tags = ['ai']
handler.command = ['deepimg']
handler.limit = true;
export default handler
