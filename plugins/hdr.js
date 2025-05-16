// instagram.com/noureddine_ouafy
// by Dxyz

import fs from 'fs';
import path from 'path';
import axios from 'axios';

let handler = async (m, { conn }) => {
    const quoted = m.quoted ? m.quoted : m;
    if (!/image/.test(quoted.mimetype)) throw '*[ ! ]* Send or reply to an image to enhance it.';
    try {
        const download = await quoted.download();
        const filePath = `./tmp/image-${Date.now()}.jpg`;
        await fs.writeFileSync(filePath, download);
        const url = await upscale(filePath);
        const buffer = await (await axios.get(url.result.imageUrl, {
            responseType: 'arraybuffer'
        }).catch(e => e.response)).data;

        let caption = `📁 Remini Photo\n> • Size: ${url.result.size || ''}`;
        await conn.sendFile(m.chat, buffer, 'enhanced.png', caption, m);
    } catch (e) {
        await m.reply('❌ Sorry, an error occurred. Possibly due to too many requests.');
        console.error('Error:', e);
    }
};

// You can find this on npm: @vioo/apis 
// Permission from the author granted

async function upscale(filePath) {
    const buffer = fs.readFileSync(filePath);
    const ext = path.extname(filePath).slice(1) || 'bin';
    const mime = ext === 'png' ? 'image/png' : ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 'application/octet-stream';
    const fileName = Math.random().toString(36).slice(2, 8) + '.' + ext;

    const { data } = await axios.post("https://pxpic.com/getSignedUrl", {
        folder: "uploads",
        fileName
    }, {
        headers: {
            "Content-Type": "application/json"
        }
    });

    await axios.put(data.presignedUrl, buffer, {
        headers: {
            "Content-Type": mime
        }
    });

    const url = "https://files.fotoenhancer.com/uploads/" + fileName;

    const api = await (await axios.post("https://pxpic.com/callAiFunction", new URLSearchParams({
        imageUrl: url,
        targetFormat: 'png',
        needCompress: 'no',
        imageQuality: '100',
        compressLevel: '6',
        fileOriginalExtension: 'png',
        aiFunction: 'upscale',
        upscalingLevel: ''
    }).toString(), {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Android 10; Mobile; rv:131.0) Gecko/131.0 Firefox/131.0',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/png,image/svg+xml,*/*;q=0.8',
            'Content-Type': 'application/x-www-form-urlencoded',
            'accept-language': 'id-ID'
        }
    }).catch(e => e.response)).data;

    const formatSize = size => {
        const round = (value, precision) => {
            const multiplier = Math.pow(10, precision || 0);
            return Math.round(value * multiplier) / multiplier;
        };
        const KB = 1024;
        const MB = KB * KB;
        const GB = KB * MB;
        const TB = KB * GB;
        if (size < KB) return size + "B";
        else if (size < MB) return round(size / KB, 1) + "KB";
        else if (size < GB) return round(size / MB, 1) + "MB";
        else if (size < TB) return round(size / GB, 1) + "GB";
        else return round(size / TB, 1) + "TB";
    };

    const buffersize = await (await axios.get(api.resultImageUrl, {
        responseType: 'arraybuffer'
    }).catch(e => e.response)).data;

    const size = await formatSize(buffer.length);
    return {
        status: 200,
        success: true,
        result: {
            size,
            imageUrl: api.resultImageUrl
        }
    };
}

handler.help = ['hdr'];
handler.tags = ['tools'];
handler.command = /^(hdr)$/i;
handler.loading = true;
handler.limit = true;
export default handler;
