import axios from 'axios';

async function hitamkan(buffer, filter = 'hitam') {
    try {
        let data = JSON.stringify({
            "imageData": Buffer.from(buffer).toString('base64'),
            "filter": filter // خيارات الفلتر: 'nerd', 'coklat', 'hitam'
        });

        const res = await axios.post('https://negro.consulting/api/process-image', data, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (res.data && res.data.status === 'success') {
            return Buffer.from(res.data.processedImageUrl.split(',')[1], "base64");
        }
    } catch (err) {
        throw err;
    }
}

let handler = async (m, { conn, usedPrefix, command, args }) => {
    if (!m.quoted || !m.quoted.mimetype || !m.quoted.mimetype.includes('image')) {
        return m.reply(`الرجاء الرد على صورة باستخدام الأمر: *${usedPrefix + command} [nerd/coklat/hitam]*`);
    }

    let filter = args[0] || 'hitam'; // الفلتر الافتراضي هو 'hitam'
    if (!['nerd', 'coklat', 'hitam'].includes(filter)) {
        return m.reply(`⚠️ الفلتر غير صحيح! استخدم: *nerd, coklat, hitam*`);
    }

    let image = await m.quoted.download();
    try {
        let processedImage = await hitamkan(image, filter);
        await conn.sendFile(m.chat, processedImage, 'processed.jpg', `✅ تمت معالجة الصورة باستخدام الفلتر: *${filter}*`, m);
    } catch (err) {
        m.reply('❌ حدث خطأ أثناء معالجة الصورة.');
    }
};

handler.help = ['hitamkan'];
handler.tags = ['ai'];
handler.command = ['hitamkan'];

export default handler;
