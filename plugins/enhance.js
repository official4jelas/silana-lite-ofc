// @instagram: noureddine_ouafy
import axios from 'axios'
import FormData from 'form-data'

async function ReminiV1(buffer) {
  if (!Buffer.isBuffer(buffer)) throw new Error('Input must be a Buffer.')
  const formData = new FormData()
  formData.append("image", buffer, {
    filename: "enhance_image_body.jpg",
    contentType: "image/jpeg"
  })
  formData.append("model_version", 1)

  const response = await axios.post(
    'https://inferenceengine.vyro.ai/enhance.vyro',
    formData,
    {
      headers: {
        ...formData.getHeaders(),
        "User-Agent": "okhttp/4.9.3",
        Connection: "Keep-Alive",
        "Accept-Encoding": "gzip"
      },
      responseType: "arraybuffer",
      timeout: 40000
    }
  )
  return Buffer.from(response.data)
}

async function ReminiV2(buffer) {
  if (!Buffer.isBuffer(buffer)) throw new Error('Input must be a Buffer.')
  const formData = new FormData()
  formData.append('image', buffer, { filename: 'image.jpg' })
  formData.append('scale', 2)

  const response = await axios.post(
    'https://api2.pixelcut.app/image/upscale/v1',
    formData,
    {
      headers: {
        ...formData.getHeaders(),
        'Accept': 'application/json'
      }
    }
  )

  const imageUrl = response.data.result_url
  if (!imageUrl) throw new Error('Failed to get the image URL.')

  const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' })
  return Buffer.from(imageResponse.data)
}

let handler = async (m, { conn, args }) => {
  let q = m.quoted || m
  let mime = (q.msg || q).mimetype || ''
  if (!mime.startsWith('image/')) throw 'Reply to an image.'

  const img = await q.download()
  let enhanced

  if ((args[0] || '').toLowerCase() === 'v2') {
    m.reply('المرجو الانتظار قليلا... يتم تحسين الصورة باستخدام Remini V2')
    enhanced = await ReminiV2(img)
  } else {
    m.reply('المرجو الانتظار قليلا... يتم تحسين الصورة باستخدام Remini V1')
    enhanced = await ReminiV1(img)
  }

  await conn.sendFile(m.chat, enhanced, 'enhanced.jpg', 'تم تحسين الصورة بنجاح!', m)
}

handler.help = ['enhance']
handler.tags = ['tools']
handler.command = /^enhance$/i
handler.limit = true;
export default handler
