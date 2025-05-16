// @noureddine_ouafy
import uploadImage from '../lib/uploadImage.js';
import fetch from 'node-fetch';

const handler = async (m, { conn }) => {
    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || '';

    if (!mime) return conn.reply(m.chat, 'Send or reply to an image with the caption *screentocode*.', m);

    let media = await q.download();
    let uploadedImageUrl = await uploadImage(media);

    console.log(`Image successfully uploaded: ${uploadedImageUrl}`);

    try {
        let response = await fetch(`https://fastrestapis.fasturl.cloud/aiexperience/screenshottocode?imageUrl=${encodeURIComponent(uploadedImageUrl)}`);
        let result = await response.json();

        console.log(`API Response: ${JSON.stringify(result)}`);

        if (result.status === 200 && result.result) {
            let previewImageUrl = result.result.previewImage;
            let extractedCode = result.result.code;

            console.log(`Preview Image: ${previewImageUrl}`);
            console.log(`Extracted Code:\n${extractedCode}`);

            await conn.sendMessage(m.chat, {
                image: { url: previewImageUrl },
                caption: `✅ *Screenshot to Code Result*\n\n📌 Here is the extracted code:\n\n\`\`\`${extractedCode}\`\`\``
            }, { quoted: m });
        } else {
            conn.reply(m.chat, '⚠️ Failed to process the image, please try again later.', m);
        }
    } catch (error) {
        console.error('An error occurred:', error);
        conn.reply(m.chat, '❌ An error occurred while processing the image.', m);
    }
};

handler.help = ['screentocode'];
handler.tags = ['tools'];
handler.command = /^screentocode|screenshot2code$/i;
handler.limit = true 
export default handler;
