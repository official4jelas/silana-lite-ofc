// instagram.com/noureddine_ouafy
import axios from 'axios'
import * as cheerio from 'cheerio'
import FormData from 'form-data'

const baseUrl = 'https://ssstik.io'
const regexTiktok = /https:\/\/(?:m|www|vm|vt|lite)?\.?tiktok\.com\/((?:.*\b(?:(?:usr|v|embed|user|video|photo)\/|\?shareId=|\&item_id=)(\d+))|\w+)/
const regexToken = /s_tt\s*=\s*'([^']+)'/
const regexOverlayUrl = /#mainpicture \.result_overlay\s*{\s*background-image:\s*url["']?([^"']+)["']?;\s*}/

const getToken = async () => {
  const { data: html } = await axios.get(baseUrl)
  const tokenMatch = html.match(regexToken)
  if (!tokenMatch || !tokenMatch[1]) throw new Error('Token not found')
  return tokenMatch[1]
}

const ssstiktok = async (tiktokUrl) => {
  if (!regexTiktok.test(tiktokUrl)) throw new Error('Invalid TikTok URL')

  const token = await getToken()

  const form = new FormData()
  form.append('id', tiktokUrl)
  form.append('locale', 'en')
  form.append('tt', token)

  const { data: html } = await axios.post(`${baseUrl}/abc?url=dl`, form, {
    headers: {
      ...form.getHeaders(),
      origin: baseUrl,
      referer: `${baseUrl}/en`,
      'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    }
  })

  const $ = cheerio.load(html)
  const username = $('h2').text().trim()
  const description = $('.maintext').text().trim()
  const likeCount = $('div.trending-actions > div.justify-content-start').eq(0).text().trim()
  const commentCount = $('div.trending-actions > div.justify-content-center > div').text().trim()
  const shareCount = $('div.trending-actions > div.justify-content-end > div').text().trim()
  const avatarUrl = $('img.result_author').attr('src')
  const videoUrl = $('a.without_watermark').attr('href')
  const musicUrl = $('a.music').attr('href')
  const css = $('style').html()
  const overlayMatch = css?.match(regexOverlayUrl)
  const overlayUrl = overlayMatch ? overlayMatch[1] : null

  return {
    username,
    description,
    stats: { likeCount, commentCount, shareCount },
    downloads: { avatarUrl, overlayUrl, videoUrl, musicUrl }
  }
}

let handler = async (m, { conn, args }) => {
  if (!args[0]) throw 'أرسل رابط فيديو تيك توك مثل:\n.tiktok https://vt.tiktok.com/xxx'
  try {
    const res = await ssstiktok(args[0])
    let message = `الاسم: ${res.username}\nالوصف: ${res.description}\n\nإعجابات: ${res.stats.likeCount}\nتعليقات: ${res.stats.commentCount}\nمشاركات: ${res.stats.shareCount}`
    await conn.sendFile(m.chat, res.downloads.videoUrl, 'tiktok.mp4', message, m)
  } catch (e) {
    throw 'فشل في تحميل الفيديو، تأكد من الرابط أو حاول لاحقًا.'
  }
}

handler.help = ['tiktok3']
handler.tags = ['downloader']
handler.command = /^tiktok3$/i
handler.limit = true 
export default handler
