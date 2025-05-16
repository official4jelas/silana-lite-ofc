// instagram.com/noureddine_ouafy

import axios from 'axios';
import fetch from 'node-fetch';
import { sticker } from '../lib/sticker.js'; // adjust this path if needed

const expressions = {
  yes: "https://raw.githubusercontent.com/rikikangsc2-eng/rikikangsc2-eng.github.io/refs/heads/main/galery/iya.jpeg",
  no: "https://raw.githubusercontent.com/rikikangsc2-eng/rikikangsc2-eng.github.io/refs/heads/main/galery/tidak.jpeg",
  angry: "https://raw.githubusercontent.com/rikikangsc2-eng/rikikangsc2-eng.github.io/refs/heads/main/galery/marah.jpeg",
  sad: "https://raw.githubusercontent.com/rikikangsc2-eng/rikikangsc2-eng.github.io/refs/heads/main/galery/sedih.jpeg",
  badmood: "https://raw.githubusercontent.com/rikikangsc2-eng/rikikangsc2-eng.github.io/refs/heads/main/galery/bt.jpeg"
};

const systemPrompt = `You are Alicia, a 17-year-old girl...`; // same as before

const fetchAiResponse = async (query, id, conn, m) => {
  try {
    const response = await axios.post(
      `https://copper-ambiguous-velvet.glitch.me/chat?user=${id}`,
      {
        message: query,
        systemPrompt: systemPrompt
      },
      {
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "Mozilla/5.0",
          "Referer": "https://copper-ambiguous-velvet.glitch.me/"
        }
      }
    );

    let message = response.data.response || null;

    if (message) {
      let stickerSent = false;
      let foundHashtag = null;

      for (const key in expressions) {
        const hashtag = `#${key}`;
        if (message.includes(hashtag)) {
          const imgBuffer = await (await fetch(expressions[key])).buffer();
          const webp = await sticker(imgBuffer, {
            packname: "Alicia",
            author: "nirkyy"
          });
          await conn.sendMessage(m.chat, { sticker: webp }, { quoted: m });
          stickerSent = true;
          foundHashtag = hashtag;
          break;
        }
      }

      if (stickerSent) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      message = message.replace(foundHashtag || '#none', '').trim();
    }

    return message;

  } catch (error) {
    return error.message;
  }
};

let handler = async (m, { conn, text }) => {
  if (!text) return m.reply('Ask Alicia something first!');
  let reply = await fetchAiResponse(text, m.sender, conn, m);
  if (reply) await m.reply(reply);
};

handler.help = handler.command = ['alicia'];
handler.tags = ['ai'];
handler.limit = true 
export default handler;
