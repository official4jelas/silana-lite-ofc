import axios from 'axios';
import cheerio from 'cheerio';

async function decxaScrape(q) {
  try {
    const { data } = await axios.get(`https://mylivewallpapers.com/?s=${q}`);
    const $ = cheerio.load(data);
    const HasilIni = $('.posts.group a').map((i, el) => $(el).attr('href')).get();

    const HasilNya = await Promise.all(
      HasilIni.map(async (url, i) => {
        await new Promise(resolve => setTimeout(resolve, i * 1000));
        try {
          const { data } = await axios.get(url);
          const $ = cheerio.load(data); 
          const TeksBersih = t => (t || '').toString()
            .replace(/<[^>]*>|\n|\s+/g, ' ')
            .replace(/<i>.*<\/i>/, '')
            .replace(/\s+/g, ' ')
            .trim();

          const UrlDownlo = $('[data-downloadurl]').map((i, el) => $(el).attr('data-downloadurl')).get();
          return $('.dbox').map((i, el) => ({
            Judul: TeksBersih($(el).find('h3').text()),
            Tipe: TeksBersih($(el).find('li:nth-child(1)').text()).replace('Type:', ''),
            Ukuran: TeksBersih($(el).find('li:nth-child(2)').text()).replace('File Size:', ''),
            Resolusi: TeksBersih($(el).find('li:nth-child(3)').text()).replace('Resolution:', ''),
            Download: UrlDownlo[i] || 'Link tidak متاح'
          })).get();
        } catch (err) {
          console.error(`خطأ أثناء معالجة: ${url}:`, err.message);
          return [];
        }
      })
    );

    return HasilNya.flat();
  } catch (err) {
    console.error('حدث خطأ:', err.message);
    return [];
  }
}

let handler = async (m, { conn, text }) => {
  if (!text) return m.reply('يرجى إدخال اسم خلفية الشاشة 🔍');

  const results = await decxaScrape(text);
  if (!results.length) return m.reply('لم يتم العثور على أي خلفيات 📭');

  let message = '📌 *نتائج البحث:*\n\n';
  results.forEach((item, index) => {
    message += `📌 *${index + 1}.* ${item.Judul}\n📁 النوع: ${item.Tipe}\n📏 الحجم: ${item.Ukuran}\n📺 الدقة: ${item.Resolusi}\n🔗 التحميل: ${item.Download}\n\n`;
  });

  m.reply(message);
};

handler.help = ['live-wallpaper'];
handler.command = ['live-wallpaper'];
handler.tags = ['downloader'];
handler.limit = true 
export default handler;
