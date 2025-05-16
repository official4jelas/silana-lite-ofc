import axios from 'axios';

function randomNumber() {
  let randomNumber = Math.floor(Math.random() * 1000000);
  return randomNumber.toString().padStart(6, '0');
}

async function upscale(buffer) {
  const blob = new Blob([buffer], { type: 'image/png' });
  let filename = randomNumber() + '.png';
  let formData = new FormData();
  formData.append('image', {});
  formData.append('image', blob, filename);

  let { data } = await axios.post('https://api.imggen.ai/guest-upload', formData, {
    headers: {
      "content-type": "multipart/form-data",
      origin: "https://imggen.ai",
      referer: "https://imggen.ai/",
      "user-agent": "Mozilla/5.0"
    }
  });

  let result = await axios.post('https://api.imggen.ai/guest-upscale-image', {
    image: {
      "url": "https://api.imggen.ai" + data.image.url,
      "name": data.image.name,
      "original_name": data.image.original_name,
      "folder_name": data.image.folder_name,
      "extname": data.image.extname
    }
  }, {
    headers: {
      "content-type": "application/json",
      origin: "https://imggen.ai",
      referer: "https://imggen.ai/",
      "user-agent": "Mozilla/5.0"
    }
  });

  return `https://api.imggen.ai${result.data.upscaled_image}`;
}

let handler = async (m, { conn }) => {
  try {
    await m.react('⌛');

    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || '';
    
    if (!mime.startsWith('image/')) {
      throw 'Please send an image with caption *hd/remini* or reply to an image!';
    }

    let media = await q.download();
    if (!media) throw 'Failed to download image.';

    let upscaledUrl = await upscale(media);
    if (!upscaledUrl) throw 'Failed to upscale image.';

    await m.react('✅');

    await conn.sendMessage(m.chat, {
      image: { url: upscaledUrl },
      caption: `*Done*`
    }, { quoted: m });

  } catch (error) {
    await m.react('❌');
    await conn.reply(m.chat, `❌ *Error:* ${error.message || error}`, m);
  }
};

handler.help = ['remini', 'hd'];
handler.tags = ['tools'];
handler.command = /^(remini|hd)$/i;
handler.limit = true;

export default handler;
