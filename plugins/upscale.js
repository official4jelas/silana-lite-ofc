import axios from 'axios';
import FormData from 'form-data';

// Define the bigjpg object
const bigjpg = {
  api: {
    base: 'https://bigjpg.com',
    endpoint: {
      task: '/task',
      free: '/free'
    }
  },
  available: {
    styles: {
      'art': 'Artwork',
      'photo': 'Photo'
    },
    noise: {
      '-1': 'None',
      '0': 'Low',
      '1': 'Medium',
      '2': 'High',
      '3': 'Highest'
    }
  },
  headers: {
    'origin': 'https://bigjpg.com',
    'referer': 'https://bigjpg.com/',
    'user-agent': 'Postify/1.0.0',
    'x-requested-with': 'XMLHttpRequest'
  },
  isValid: (style, noise) => {
    if (!style && !noise) {
      return { valid: true, style: 'art', noise: '-1' };
    }
    if (style && !bigjpg.available.styles[style]) {
      return {
        valid: false,
        error: `Invalid style, bro.. Choose one of these: ${Object.keys(bigjpg.available.styles).join(', ')} 🗿`
      };
    }
    if (noise && !bigjpg.available.noise[noise]) {
      return {
        valid: false,
        error: `Invalid noise level, bro.. Choose one of these: ${Object.keys(bigjpg.available.noise).join(', ')} 😌`
      };
    }
    return { valid: true, style: style || 'art', noise: noise || '-1' };
  },
  getImageInfo: async (img) => {
    if (!img) {
      return {
        valid: false,
        error: "Come on, bro... Give me the image link, don't leave it empty like this 🗿"
      };
    }
    try {
      const response = await axios.get(img, { responseType: 'arraybuffer' });
      const fileSize = parseInt(response.headers['content-length'] || response.data.length);
      const width = Math.floor(Math.random() * (2000 - 800 + 1)) + 800;
      const height = Math.floor(Math.random() * (2000 - 800 + 1)) + 800;
      let fileName = img.split('/').pop().split('#')[0].split('?')[0] || 'image.jpg';
      if (fileName.endsWith('.webp')) {
        fileName = fileName.replace('.webp', '.jpg');
      }
      if (fileSize > 5 * 1024 * 1024) {
        return {
          valid: false,
          error: "The image size is too big, bro.. Max 5MB, okay? 😋"
        };
      }
      return {
        valid: true,
        info: { fileName, fileSize, width, height }
      };
    } catch (err) {
      return {
        valid: false,
        error: "The image link is broken, bro.. Try another link, okay? 🙈"
      };
    }
  },
  upscale: async (img, options = {}) => {
    const validation = await bigjpg.getImageInfo(img);
    if (!validation.valid) {
      return { success: false, code: 400, result: { error: validation.error } };
    }
    const inputx = bigjpg.isValid(options.style, options.noise);
    if (!inputx.valid) {
      return { success: false, code: 400, result: { error: inputx.error } };
    }
    const config = {
      x2: '2',
      style: inputx.style,
      noise: inputx.noise,
      file_name: validation.info.fileName,
      files_size: validation.info.fileSize,
      file_height: validation.info.height,
      file_width: validation.info.width,
      input: img
    };
    try {
      const params = new URLSearchParams();
      params.append('conf', JSON.stringify(config));
      const taskx = await axios.post(
        `${bigjpg.api.base}${bigjpg.api.endpoint.task}`,
        params,
        { headers: bigjpg.headers }
      );
      if (taskx.data.status !== 'ok') {
        return { success: false, code: 400, result: { error: "Something went wrong, oops 💃🏻" } };
      }
      const taskId = taskx.data.info;
      let attempts = 0;
      const maxAttempts = 20;
      while (attempts < maxAttempts) {
        const res = await axios.get(
          `${bigjpg.api.base}${bigjpg.api.endpoint.free}?fids=${JSON.stringify([taskId])}`,
          { headers: bigjpg.headers }
        );
        const result = res.data[taskId];
        if (result[0] === 'success') {
          return {
            success: true,
            code: 200,
            result: {
              info: validation.info,
              url: result[1],
              size: result[2],
              config: {
                style: config.style,
                styleName: bigjpg.available.styles[config.style],
                noise: config.noise,
                noiseName: bigjpg.available.noise[config.noise]
              }
            }
          };
        } else if (result[0] === 'error') {
          return {
            success: false,
            code: 400,
            result: { error: "Upscaling failed, bro.. Try again later, okay? 🙈" }
          };
        }
        // Corrected line: Removed the erroneous "\new Promise"
        await new Promise(resolve => setTimeout(resolve, 15000));
        attempts++;
      }
      return { success: false, code: 400, result: { error: "Timed out, bro.. 😂" } };
    } catch (err) {
      return { success: false, code: 400, result: { error: err.message || "Something went wrong, bro 🗿" } };
    }
  }
};

// Define the handler
let handler = async (m, { conn, args, text }) => {
  let imgUrl = null;

  if (m.quoted && m.quoted.mtype === 'imageMessage') {
    imgUrl = m.quoted.media; // Assume media contains the image URL
  } else if (m.mtype === 'imageMessage') {
    imgUrl = m.media; // Direct image message
  } else if (text) {
    const urlMatch = text.match(/(https?:\/\/[^\s]+)/i);
    if (urlMatch) imgUrl = urlMatch[0];
  }

  if (!imgUrl) {
    return conn.reply(m.chat, 'Please provide an image URL or reply to an image. Example: *upscale <url> [style] [noise]*\nAvailable styles: art, photo\nNoise levels: -1, 0, 1, 2, 3', m);
  }

  let style = null;
  let noise = null;
  const params = text.split(/\s+/).filter(arg => arg && arg !== imgUrl);

  if (params.length > 0) style = params[0];
  if (params.length > 1) noise = params[1];

  try {
    const result = await bigjpg.upscale(imgUrl, { style, noise });

    if (!result.success) {
      return conn.reply(m.chat, result.result.error || 'Failed to upscale the image. Please try again.', m);
    }

    const { info, url, size, config } = result.result;
    const replyText = `✅ *Image Upscaled Successfully!*\n\n` +
                     `📜 *Details:*\n` +
                     `- File: ${info.fileName}\n` +
                     `- Original Size: ${(info.fileSize / 1024).toFixed(2)} KB\n` +
                     `- Dimensions: ${info.width}x${info.height}\n` +
                     `- Style: ${config.styleName} (${config.style})\n` +
                     `- Noise: ${config.noiseName} (${config.noise})\n` +
                     `- Upscaled Size: ${(size / 1024).toFixed(2)} KB\n` +
                     `- URL: ${url}`;

    await conn.reply(m.chat, replyText, m);

  } catch (err) {
    await conn.reply(m.chat, `An error occurred: ${err.message || 'Unknown error'}. Please try again later.`, m);
  }
};

// Define command metadata
handler.help = ['upscale'];
handler.command = ['upscale'];
handler.tags = ['tools'];
handler.limit = true 
export default handler;
