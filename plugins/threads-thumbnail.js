import axios from "axios";
import FormData from "form-data";
import * as cheerio from "cheerio";
import { URL } from "url";

const base = {
    _token: "https://snapvn.com/id",
    _dl: "https://snapvn.com/fetch"
}

let handler = async (m, { conn, text }) => {
    if (!text) return m.reply("Please provide a Threads URL to download!");
    
    try {
        const { token, cookies } = await getToken();
        const result = await download(text, token, cookies);
        
        // تسجيل الروابط للتحقق
        console.log("Download List:", result.downloadList);
        console.log("Thumbnail:", result.thumbnail);

        // التحقق من وجود روابط أو صورة مصغرة
        if (!result.thumbnail && result.downloadList.length === 0) {
            return m.reply(`No media found to download! Download links: ${result.downloadList.join(', ')}`);
        }

        // استخدام الصورة المصغرة أولاً (أكثر موثوقية)
        let mediaUrl = result.thumbnail || (result.downloadList.length > 0 ? result.downloadList[0] : null);

        if (!mediaUrl) {
            return m.reply("No valid media URL found!");
        }

        // التحقق من صحة الرابط وتحويله إلى رابط مطلق إذا لزم الأمر
        try {
            new URL(mediaUrl);
        } catch {
            if (!mediaUrl.startsWith('http')) {
                mediaUrl = new URL(mediaUrl, base._token).href;
            } else {
                throw new Error("Invalid media URL: " + mediaUrl);
            }
        }

        // تحميل الميديا مع متابعة إعادة التوجيه
        const mediaResponse = await axios.get(mediaUrl, {
            responseType: 'arraybuffer',
            maxRedirects: 5,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
                "Accept": "image/jpeg,image/png,video/mp4,*/*;q=0.8",
                "Referer": "https://snapvn.com/",
                "Cookie": cookies,
                "Accept-Language": "en-US,en;q=0.9",
                "Connection": "keep-alive"
            }
        });

        // التحقق من أن البيانات ليست فارغة
        if (!mediaResponse.data || mediaResponse.data.length === 0) {
            return m.reply(`Failed to download media: Empty response from ${mediaUrl}`);
        }

        const mediaBuffer = Buffer.from(mediaResponse.data);

        // التحقق من حجم البافر
        if (mediaBuffer.length < 100) {
            return m.reply(`Downloaded media is too small or invalid: ${mediaUrl}`);
        }

        // تحديد اسم الملف بناءً على نوع الميديا
        const fileName = mediaUrl.includes('.mp4') ? 'media.mp4' : 'media.jpg';

        // إرسال معلومات أساسية
        let info = `Username: ${result.username}\n` +
                   `Likes: ${result.like}\n` +
                   `Caption: ${result.caption}`;
        
        // إرسال الميديا مباشرة
        await conn.sendFile(m.chat, mediaBuffer, fileName, info, m);
    } catch (error) {
        await conn.reply(m.chat, `Error: ${error.message}`, m);
    }
}

async function getToken() {
    const res = await axios.get(base._token, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9"
        }
    });

    const cookies = res.headers['set-cookie']?.map(c => c.split(';')[0]).join('; ') || "";
    const $ = cheerio.load(res.data);
    const token = $("input[name='_token']").val();

    return { token, cookies };
}

async function download(url, token, cookies) {
    const form = new FormData();
    form.append("_token", token);
    form.append("url", url);

    const headers = {
        ...form.getHeaders(),
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
        "Accept": "*/*",
        "Accept-Language": "en-US,en;q=0.9",
        "Cookie": cookies,
        "Referer": base._token
    };

    const { data } = await axios.post(base._dl, form, { headers });
    let $ = cheerio.load(data.data);

    let username = $('.d-flex.align-items-center strong').text().trim();
    let like = $('.d-flex.align-items-center small').text().replace('Like:', '').trim();
    let caption = $('.col-md-12 .markdown').text().trim();
    let thumbnail = $('.card-img-top').attr('data-src');
    
    let downloadList = [];
    $('select[name="url"] option').each((i, el) => {
        const val = $(el).val();
        if (val) downloadList.push(val);
    });
    
    return { username, like, caption, thumbnail, downloadList };
}

handler.help = ['threads-thumbnail']
handler.command = ['threads-thumbnail']
handler.tags = ['downloader']
handler.limit = true 
export default handler
