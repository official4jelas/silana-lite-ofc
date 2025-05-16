/*
YouTube Music Play
*/

import yts from 'yt-search';
import axios from 'axios';

var handler = async (m, { text, usedPrefix, command }) => {
    if (!text) throw `❎ Please enter the song title!\n\nExample:\n*${usedPrefix + command} Cloud Trails Airplane*`;

    await m.react('🕐');

    let res = await yts(text);
    let vid = res.videos[0];

    try {
      const data = (await axios.get(`https://rayhanzuck-yt.hf.space/?url=${vid.url}&format=mp3&quality=128`)).data;
      if (!data.media) throw '❎ An error occurred with the API.';

      await conn.sendMessage(m.chat, {
        audio: { url: data.media, },
        mimetype: 'audio/mpeg',
        contextInfo: {
          externalAdReply: {
            title: vid.title,
            body: data.author.name,
            mediaType: 2,
            mediaUrl: vid.url,
            thumbnailUrl: vid.thumbnail,
            sourceUrl: vid.url,
            containsAutoReply: true,
            renderLargerThumbnail: true,
            showAdAttribution: false,
          }
        }
      }, { quoted: m})
      await m.react('✅');
    } catch (e) {
      await m.react('❌');
      throw `❎ Could not download, please try again. Error: ${e.message}`;
    }
};

handler.help = ['song']
handler.command = (/^song?/i)
handler.tags = ['downloader'];
handler.limit = true 
export default handler;
