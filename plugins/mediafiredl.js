// instagram.com/noureddine_ouafy
import axios from 'axios';

const handler = async (m, { conn, text, prefix, command }) => {
  try {
    if (!text) return m.reply(`Example: ${prefix + command} mediafire link`);
    if (!text.includes('mediafire.com')) return m.reply('The link must be a Mediafire URL!');
    
    conn.sendMessage(m.chat, { react: { text: "🔎", key: m.key } });

    const { data } = await axios.get(`https://api.vreden.web.id/api/mediafiredl?url=${text}`);
    const res = data.result[0];

    const file_name = decodeURIComponent(res.nama);
    const extension = file_name.split('.').pop().toLowerCase();

    const response = await axios.get(res.link, { responseType: 'arraybuffer' });
    const media = Buffer.from(response.data);

    let mimetype = '';
    if (extension === 'mp4') mimetype = 'video/mp4';
    else if (extension === 'mp3') mimetype = 'audio/mp3';
    else mimetype = `application/${extension}`;

    await conn.sendMessage(m.chat, {
      document: media,
      fileName: file_name,
      mimetype: mimetype
    }, { quoted: m });

  } catch (err) {
    console.error(err.message);
    m.reply('An error occurred');
  }
};

handler.command = ["mediafiredl"];
handler.tags = ["downloader"];
handler.help = ["mediafiredl"];
handler.limit = true;
export default handler;
