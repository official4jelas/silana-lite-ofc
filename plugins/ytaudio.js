import axios from 'axios';
let handler = async (m, { conn, text }) => {
    if (!text) return m.reply('⚠️ Please enter a YouTube URL. Example: ytaudio <url>');
    let url = text.split(' ')[0];

    if (!/^https?:\/\/(www\.)?youtube\.com|youtu\.be\//.test(url)) {
        return m.reply('⚠️ Invalid YouTube URL. Please enter a valid URL.');
    }
    try {
        await m.reply('⏳ Processing...');
        let apiUrl = `https://downloader.cloudkuimages.com/api/audio?url=${encodeURIComponent(url)}`;
        let { data } = await axios.get(apiUrl, { timeout: 15000 });

        if (!data || data.status !== "success" || !data.result || !data.result.url) {
            return m.reply('❌ Failed to retrieve audio. Try again!');
        }

        let { title, author, duration, thumbnail, size, url: downloadUrl } = data.result;
        let fileSize = parseFloat(size);

        let caption = `✦ *YouTube Audio Downloader*
✧ *Title:* ${title}
✦ *Uploader:* ${author}
✧ *Duration:* ${duration}
✦ *Size:* ${size} MB

⚝ *Downloading...*`;

        // Send thumbnail & info
        await conn.sendMessage(m.chat, { image: { url: thumbnail }, caption }, { quoted: m });
        if (fileSize <= 50) {
            await conn.sendMessage(m.chat, {
                audio: { url: downloadUrl },
                mimetype: 'audio/mpeg',
                ptt: true
            }, { quoted: m });
        } else {
            await conn.sendMessage(m.chat, {
                document: { url: downloadUrl },
                fileName: `${title}.mp3`,
                mimetype: 'audio/mpeg'
            }, { quoted: m });
        }
    } catch (error) {
        console.error(error);
        return m.reply('❌ An error occurred while fetching data from the API. Try again later.');
    }
};
handler.help = ['ytaudio'];
handler.tags = ['downloader'];
handler.command = /^ytaudio$/i;
handler.limit = true;
handler.register = false;
export default handler;
