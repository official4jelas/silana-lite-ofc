//plugin by instagram.com/noureddine_ouafy
//scrape by Putu_ex's
//thanks for the scraper 
import cheerio from 'cheerio';
import fetch from 'node-fetch';
import { URLSearchParams } from 'url';

const handler = async (m, { conn }) => {
  const url = m.text.split(' ')[1]; // استخراج الرابط من الرسالة
  if (!url) return conn.reply(m.chat, 'Please provide a Douyin URL', m);

  try {
    const result = await douyin(url);
    
    // البحث عن رابط MP4 (جودة عشوائية)
    const mp4Link = result.dl.find(link => link.text.toLowerCase().includes('mp4'))?.url;
    // البحث عن رابط MP3
    const mp3Link = result.dl.find(link => link.text.toLowerCase().includes('mp3'))?.url;

    if (!mp4Link || !mp3Link) {
      return conn.reply(m.chat, 'Could not find MP4 or MP3 links.', m);
    }

    // إرسال ملف MP4
    await conn.sendMessage(m.chat, {
      video: { url: mp4Link },
      caption: `Here is the video from Douyin: ${result.title}`
    }, { quoted: m });

    // إرسال ملف MP3
    await conn.sendMessage(m.chat, {
      audio: { url: mp3Link },
      mimetype: 'audio/mp3',
      caption: `Here is the audio from Douyin: ${result.title}`
    }, { quoted: m });

  } catch (error) {
    await conn.reply(m.chat, `Error: ${error.message}`, m);
  }
};

async function douyin(url) {
  const apiUrl = 'https://lovetik.app/api/ajaxSearch';
  const formBody = new URLSearchParams();
  formBody.append('q', url);
  formBody.append('lang', 'id');

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'Accept': '*/*',
      'X-Requested-With': 'XMLHttpRequest'
    },
    body: formBody.toString()
  });

  const data = await response.json();
  if (data.status !== 'ok') {
    throw new Error('Failed to fetch video data');
  }

  const $ = cheerio.load(data.data);
  const title = $('h3').text();
  const thumbnail = $('.image-tik img').attr('src');
  const duration = $('.content p').text();
  const dl = [];

  $('.dl-action a').each((i, el) => {
    dl.push({
      text: $(el).text().trim(),
      url: $(el).attr('href')
    });
  });

  return {
    title,
    thumbnail,
    duration,
    dl
  };
}

handler.help = ['douyin'];
handler.command = ['douyin'];
handler.tags = ['downloader'];
handler.limit = true 
export default handler;
