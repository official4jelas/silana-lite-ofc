import crypto from 'crypto';
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

const handler = async (m, { conn }) => {
  const quoted = m.quoted ? m.quoted : m;
  const mime = (quoted.msg || quoted).mimetype || '';
  
  if (!/audio|video/.test(mime)) {
    return m.reply('Send or reply to a video or audio with the caption .talknotes');
  }
  
  m.reply('*Please Wait...*');
  
  try {
    let buffer = await quoted.download();
    
    const fileSizeInBytes = buffer.length;
    const maxSize = 5 * 1024 * 1024;

    if (fileSizeInBytes > maxSize) {
      return m.reply("Max size is 5 MB");
    }

    const result = await Talknotes(buffer);
    
    if (!result || !result.text) {
      return m.reply('Failed, please try again later. Don’t spam.');
    }
    
    m.reply(`*Result:*\n\n${result.text}`);
    
  } catch (error) {
    console.error(error);
    m.reply('An error occurred while processing the audio.');
  }
};

function generateToken(secretKey) {
  const timestamp = Date.now().toString();
  const hmac = crypto.createHmac('sha256', secretKey);
  hmac.update(timestamp);
  const token = hmac.digest('hex');

  return {
    "x-timestamp": timestamp,
    "x-token": token
  };
}

async function Talknotes(buffer) {
  try {
    const form = new FormData();
    form.append('file', buffer, {
      filename: 'file1.mp3',
      contentType: 'audio/mpeg'
    });

    const tokenData = generateToken('w0erw90wr3rnhwoi3rwe98sdfihqio432033we8rhoeiw');
    const headers = {
      ...form.getHeaders(),
      'x-timestamp': tokenData['x-timestamp'],
      'x-token': tokenData['x-token'],
      "authority": "api.talknotes.io",
      "method": "POST",
      "path": "/tools/converter",
      "scheme": "https",
      "accept": "*/*",
      "accept-encoding": "gzip, deflate, br",
      "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
      "origin": "https://talknotes.io",
      "referer": "https://talknotes.io/",
      "sec-ch-ua": "\"Not A(Brand\";v=\"8\", \"Chromium\";v=\"132\"",
      "sec-ch-ua-mobile": "?1",
      "sec-ch-ua-platform": "\"Android\"",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-site",
      "user-agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Mobile Safari/537.36"
    };

    const response = await axios.post('https://api.talknotes.io/tools/converter', form, { headers });
    return response.data;
  } catch (error) {
    console.error("An error occurred:", error.message);
    return null;
  }
}

handler.help = ['talknotes'];
handler.command = ['talknotes'];
handler.tags = ['tools'];
handler.limit = true 
export default handler;
