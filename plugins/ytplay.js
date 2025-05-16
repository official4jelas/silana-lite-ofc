// Instagram: noureddine_ouafy
// Plugin: YouTube Audio Play
// API Source: https://api.nekorinn.my.id

import fetch from 'node-fetch';

const handler = async (m, { conn, args, command }) => {
  const query = args.join(' ');
  if (!query) throw `Example: .${command} faded`;

  await conn.sendMessage(m.chat, { react: { text: '🎀', key: m.key } });

  try {
    const api = `https://api.nekorinn.my.id/downloader/ytplay-savetube?q=${encodeURIComponent(query)}`;
    const res = await fetch(api);
    const json = await res.json();

    if (!json?.status || !json?.result) throw 'Failed to fetch video data.';

    const {
      title = 'Untitled',
      channel = 'Unknown',
      duration = '-',
      imageUrl = '',
      link = ''
    } = json.result.metadata || {};

    const audioUrl = json.result.downloadUrl;
    if (!audioUrl) throw 'Audio not available for this video.';

    const caption = `
\`Y O U T U B E - P L A Y\`

• Title: ${title}
• Channel: ${channel}
• Duration: ${duration}
• Link: ${link}
• Format: Audio
`.trim();

    await conn.sendMessage(m.chat, {
      text: caption,
      contextInfo: {
        externalAdReply: {
          title: title,
          body: 'Play Music',
          thumbnailUrl: imageUrl,
          sourceUrl: link,
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: m });

    const checkAudio = await fetch(audioUrl, { method: 'HEAD' });
    if (!checkAudio.ok) throw 'Audio is not accessible or the link is dead.';

    await conn.sendMessage(m.chat, {
      audio: { url: audioUrl },
      mimetype: 'audio/mp4',
      ptt: false
    }, { quoted: m });

  } catch (e) {
    console.error('Error:', e);
    throw 'An error occurred while processing or sending the audio.';
  }
};

handler.help = ['ytplay'];
handler.tags = ['downloader'];
handler.command = ['ytplay'];
handler.limit = true 
export default handler;
