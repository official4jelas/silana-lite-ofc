import axios from 'axios';
import cheerio from 'cheerio';
import qs from 'qs';

async function ytdl(url) {
    try {
        const kuki = await axios.get('https://youtubedownloader.app/');
        const $ = cheerio.load(kuki.data);
        const cookie = kuki.headers['set-cookie'][1].split(';')[0];
        const token = $('meta[name="csrf-token"]').attr('content');

        let data = qs.stringify({
            'keyword': url,
            'secret_code': '1'
        });

        const res = await axios.post('https://youtubedownloader.app/nocache/get-youtube-videos', data, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'x-csrf-token': token,
                'Origin': 'https://youtubedownloader.app',
                'Cookie': cookie
            },
        });

        return {
            title: res.data.video_title,
            thumbnail: res.data.thumbnail,
            download: res.data.youtube_video_url
        };
    } catch (error) {
        throw new Error('❌ فشل في جلب بيانات الفيديو.');
    }
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
    if (!args[0]) {
        return m.reply(`⚠️ يرجى إدخال رابط فيديو يوتيوب!\n\nمثال: *${usedPrefix + command} https://youtube.com/shorts/lcMLyQlQZcI?si=CrTWBvB7yRf9RCZV*`);
    }

    try {
        let video = await ytdl(args[0]);
        let caption = `📌 *العنوان:* ${video.title}`;

        await conn.sendMessage(m.chat, { video: { url: video.download }, caption }, { quoted: m });
    } catch (error) {
        m.reply('❌ حدث خطأ أثناء جلب الفيديو.');
    }
};

handler.help = ['ytv'];
handler.tags = ['downloader'];
handler.command = ['ytv'];

export default handler;
