import fetch from 'node-fetch';
import FormData from 'form-data';
import { fileTypeFromBuffer } from 'file-type';
const { proto, prepareWAMessageMedia } = (await import('@adiwajshing/baileys')).default;

/**
 * @param {Object} m
 * @param {Object} 
 */
let handler = async (m, { conn }) => {
    try {
        let q = m.quoted ? m.quoted : m;
        let mime = (q.msg || q).mimetype || q.mediaType || '';
        if (!mime || mime == 'conversation') return m.reply('What do you want to upload?');
        let media = await q.download();
        let link = await uploadFile(media);
        if (!link) throw 'Failed to upload media.';

        let shortLink = await shortUrl(link);

        let caption = `╭─ 「 UPLOAD SUCCESS 」
📂 Size: ${media.length} Byte
🌍 URL: ${link}
🔗 Short URL: ${shortLink}
📌 Expired: Unknown
╰───────────────`;

        let thumbnail = await prepareWAMessageMedia(
            { image: { url: link } },
            { upload: conn.waUploadToServer }
        );

        let msg = {
            interactiveMessage: proto.Message.InteractiveMessage.create({
                header: proto.Message.InteractiveMessage.Header.create({
                    hasMediaAttachment: true,
                    ...thumbnail
                }),
                body: proto.Message.InteractiveMessage.Body.create({ text: caption }),
                footer: proto.Message.InteractiveMessage.Footer.create({
                    text: "Click the button below to copy the link."
                }),
                nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                    buttons: [
                        {
                            name: "cta_copy",
                            buttonParamsJson: JSON.stringify({
                                display_text: "Copy Link",
                                copy_code: link
                            })
                        },
                        {
                            name: "cta_copy",
                            buttonParamsJson: JSON.stringify({
                                display_text: "Copy Short Link",
                                copy_code: shortLink
                            })
                        }
                    ]
                })
            })
        };

        await conn.relayMessage(m.chat, msg, { messageId: m.key.id });

    } catch (error) {
        conn.reply(m.chat, `Error: ${error.message || error}`, m);
    }
}

handler.help = ['tourl2']
handler.tags = ['uploader']
handler.command = /^(tourl2)$/i
handler.limit = true
export default handler;

/**
 * @param {Buffer}
 * @returns {Promise<string>}
 */
async function uploadFile(buffer) {
    const uploadServices = [catbox, pomf2, quAx, telegraph, tmpfiles];

    for (const upload of uploadServices) {
        try {
            return await upload(buffer);
        } catch (e) { }
    }
    throw new Error('All services failed to upload the file.');
}

/**
 * @param {string}
 * @returns {Promise<string>}
 */
async function shortUrl(url) {
    try {
        let res = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`);
        if (!res.ok) throw new Error();
        return await res.text();
    } catch {
        return url;
    }
}

/**
 * Upload to catbox
 */
async function catbox(buffer) {
    const { ext, mime } = (await fileTypeFromBuffer(buffer)) || { ext: 'bin', mime: 'application/octet-stream' };
    const form = new FormData();
    form.append('reqtype', 'fileupload');
    form.append('fileToUpload', buffer, { filename: `file.${ext}`, contentType: mime });

    const res = await fetch('https://catbox.moe/user/api.php', { method: 'POST', body: form });
    if (!res.ok) throw new Error();
    return await res.text();
}

/**
 * Try if failed, continue uploading file to Pomf2
 */
async function pomf2(buffer) {
    const { ext } = (await fileTypeFromBuffer(buffer)) || { ext: 'bin' };
    const form = new FormData();
    form.append('files[]', buffer, { filename: `file.${ext}`, contentType: 'application/octet-stream' });

    const res = await fetch('https://pomf2.lain.la/upload.php', { method: 'POST', body: form });
    const json = await res.json();
    if (!json.files || !json.files[0].url) throw new Error();
    return json.files[0].url;
}

/**
 * Try if failed, continue uploading file to Qu.ax
 */
async function quAx(buffer) {
    const { ext } = (await fileTypeFromBuffer(buffer)) || { ext: 'bin' };
    const form = new FormData();
    form.append('files[]', buffer, { filename: `file.${ext}`, contentType: 'application/octet-stream' });

    const res = await fetch('https://qu.ax/upload.php', { method: 'POST', body: form });
    const json = await res.json();
    if (!json.success || !json.files || !json.files[0].url) throw new Error();
    return json.files[0].url;
}

/**
 * Try if failed, continue uploading file to Telegra.ph
 */
async function telegraph(buffer) {
    const { ext, mime } = (await fileTypeFromBuffer(buffer)) || { ext: 'bin', mime: 'application/octet-stream' };
    const form = new FormData();
    form.append('file', buffer, { filename: `tmp.${ext}`, contentType: mime });

    const res = await fetch('https://telegra.ph/upload', { method: 'POST', body: form });
    const json = await res.json();
    if (!json[0] || !json[0].src) throw new Error();
    return 'https://telegra.ph' + json[0].src;
}

/**
 * @param {Buffer} buffer
 * @returns {Promise<string>}
 */
async function tmpfiles(buffer) {
    const { ext, mime } = await fileTypeFromBuffer(buffer);
    let form = new FormData();
    form.append('file', buffer, { filename: `tmp.${ext}`, contentType: mime });

    let res = await fetch('https://tmpfiles.org/api/v1/upload', {
        method: 'POST',
        body: form
    });

    let json = await res.json();
    if (!json.data || !json.data.url) throw new Error();
    return json.data.url;
      }
