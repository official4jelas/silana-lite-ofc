/*
* TikTok Download HD Plugin (ESM)
* Supports both video and slide content
*/

import axios from 'axios';
import cheerio from 'cheerio';

function extractUrl(url) {
  let match = url.match(/\/(hd|dl|mp3)\/([A-Za-z0-9+/=]+)/);
  if (match && match[2]) {
    let link = match[2];
    return Buffer.from(link, 'base64').toString('utf-8');
  };
  return url;
}

async function musicaldown(url) {
  const cfg = {
    headers: {
      'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36'
    }
  }
  try {
    let res = await axios.get('https://musicaldown.com/id/download', cfg)
    const $initial = cheerio.load(res.data)
    const url_name = $initial('#link_url').attr('name')
    const ko = $initial('#submit-form > div')
    const token = ko.find('div.inputbg input[type=hidden]:nth-child(2)')
    const verify = ko.find('div.inputbg input[type=hidden]:nth-child(3)')
    let data = {
      [url_name]: url,
      [token.attr('name')]: token.attr('value'),
      verify: verify.attr('value')
    }

    let pageDl = await axios.post('https://musicaldown.com/id/download', new URLSearchParams(data), {
      headers: {
        ...cfg.headers,
        cookie: res.headers['set-cookie'].join('; ')
      }
    })

    const $dl = cheerio.load(pageDl.data)
    let isSlide = $dl('div.card-image')

    if (isSlide.length === 0) {
      let getPageMusic = await axios.post('https://musicaldown.com/id/mp3', '', {
        headers: {
          ...cfg.headers,
          cookie: res.headers['set-cookie'].join('; ')
        }
      })
      const $music = cheerio.load(getPageMusic.data)
      const audio = $music('a[data-event="mp3_download_dclick"]').attr('href')
      return {
        status: true,
        type: 'video',
        video: extractUrl($dl('a[data-event="mp4_download_click"]').attr('href')),
        video_hd: extractUrl($dl('a[data-event="hd_download_click"]').attr('href')),
        video_wm: extractUrl($dl('a[data-event="watermark_download_click"]').attr('href')),
        audio
      }
    } else {
      let image = [];
      isSlide.each((_, e) => {
        image.push($dl(e).find("img").attr("src"))
      })
      let audio = extractUrl($dl('a[data-event="mp3_download_click"]').attr('href'))
      let getToken = pageDl.data.match(/ data: '(.*?)'\n/)[1]
      let vidSlide = await axios.post('https://mddown.xyz/slider', new URLSearchParams({ data: getToken }), cfg)
      return {
        status: true,
        type: 'slide',
        image,
        video: vidSlide.data.url,
        audio
      }
    }
  } catch(e) {
    return {
      status: false,
      message: `Download failed: ${e.message}`
    }
  }
}

async function handler(m, { conn, args, usedPrefix }) {
  if (!args[0]) {
    return m.reply('Please provide a TikTok link')
  }
  
  m.reply('Please wait...')
  
  try {
    const result = await musicaldown(args[0])
    
    if (!result.status) {
      return m.reply(result.message)
    }

    if (result.type === 'video') {
      await conn.sendMessage(m.chat, {
        video: { url: result.video_hd || result.video }
      })
      
      await conn.sendMessage(m.chat, {
        audio: { url: result.audio },
        mimetype: 'audio/mp4'
      })
      
    } else if (result.type === 'slide') {
      for (let img of result.image) {
        await conn.sendMessage(m.chat, {
          image: { url: img }
        })
      }
      
      if (result.audio) {
        await conn.sendMessage(m.chat, {
          audio: { url: result.audio },
          mimetype: 'audio/mp4'
        })
      }
    }
    
  } catch (e) {
    m.reply('Error occurred: ' + e.message)
  }
}

handler.help = ['tiktokdown'];
handler.tags = ['downloader']
handler.command = ['tiktokdown'];
handler.limit = true 
export default handler;
