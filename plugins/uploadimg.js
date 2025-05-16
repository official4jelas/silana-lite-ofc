import axios from 'axios'
import cheerio from 'cheerio'
import FormData from 'form-data'

async function postimg(buffer) {
    try {
        let data = new FormData()
        data.append('optsize', '0')
        data.append('expire', '0')
        data.append('numfiles', '1')
        data.append('upload_session', Math.random())
        data.append('file', buffer, `${Date.now()}.jpg`)

        const res = await axios.post('https://postimages.org/json/rr', data)
        const html = await axios.get(res.data.url)
        const $ = cheerio.load(html.data)

        let link = $('#code_html').attr('value')
        let image = $('#code_direct').attr('value')
        let delimg = $('#code_remove').attr('value')
        
        return { link, image, delimg }
    } catch (err) {
        throw err
    }
}

let handler = async (m, { conn }) => {
    if (!m.quoted || !m.quoted.mimetype || !m.quoted.mimetype.includes('image')) {
        return m.reply('🚫 المرجو الرد على صورة لرفعها')
    }

    let buffer = await m.quoted.download()
    let res = await postimg(buffer)
    
    let caption = `✅ **تم رفع الصورة بنجاح**\n\n🌐 **رابط العرض:** ${res.image}\n🗑 **رابط الحذف:** ${res.delimg}`
    
    conn.sendMessage(m.chat, { image: { url: res.image }, caption }, { quoted: m })
}

handler.help = ['uploadimg']
handler.tags = ['uploader']
handler.command = ['uploadimg']
handler.limit = true;
export default handler
