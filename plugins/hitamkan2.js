import axios from 'axios'

async function hitamkan(buffer, filter = 'hitam') {
  try {
    let data = JSON.stringify({
      imageData: Buffer.from(buffer).toString('base64'),
      filter: filter // nerd, coklat, hitam
    })

    const res = await axios.post('https://negro.consulting/api/process-image', data, {
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (res.data && res.data.status === 'success') {
      return Buffer.from(res.data.processedImageUrl.split(',')[1], 'base64')
    } else {
      throw new Error('فشل في معالجة الصورة')
    }

  } catch (err) {
    throw err
  }
}

let handler = async (m, { conn, args }) => {
  if (!m.quoted || !/image/.test(m.quoted.mimetype)) {
    return m.reply('الرد على صورة لاستخدام هذا الأمر.')
  }

  let filter = args[0] || 'hitam'
  if (!['hitam', 'nerd', 'coklat'].includes(filter)) {
    return m.reply('المرجو اختيار فلتر صحيح: hitam, nerd, coklat')
  }

  let buffer = await m.quoted.download()
  try {
    let result = await hitamkan(buffer, filter)
    conn.sendFile(m.chat, result, 'hitamkan.jpg', `تم تطبيق فلتر: ${filter}`, m)
  } catch (e) {
    console.error(e)
    m.reply('حدث خطأ أثناء المعالجة.')
  }
}

handler.help = handler.command = ['hitamkan2']
handler.tags = ['tools']
handler.limit = true 
export default handler
