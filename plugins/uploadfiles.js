import FormData from 'form-data';
import crypto from 'crypto';
import path from 'path';

let handler = async (m, { conn }) => {
    // Check if message contains media or is quoted media
    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || '';
    
    if (!mime) {
        return conn.reply(m.chat, 'Please send or quote a file to upload', m);
    }

    try {
        await conn.reply(m.chat, 'Uploading file to CDN...', m);
        
        const buffer = await q.download();
        const originalFilename = q.msg?.fileName || 'file';
        
        // Upload to CDN
        const ext = path.extname(originalFilename);
        const randomFilename = crypto.randomBytes(8).toString('hex') + ext;
        const form = new FormData();
        form.append('file', buffer, { filename: randomFilename });

        const response = await fetch('https://upload.cifumo.xyz/api/upload', {
            method: 'POST',
            body: form,
            headers: form.getHeaders()
        });

        const result = await response.json();
        
        if (!result.url) {
            return conn.reply(m.chat, 'Failed to upload file to CDN', m);
        }

        await conn.reply(m.chat, `✅ File uploaded successfully!\n🔗 URL: ${result.url}`, m);
        
    } catch (error) {
        console.error('Upload error:', error);
        conn.reply(m.chat, 'An error occurred while uploading the file', m);
    }
}

handler.help = ['uploadfiles'];
handler.command = ['uploadfiles'];
handler.tags = ['uploader'];
handler.limit = true 
export default handler;
