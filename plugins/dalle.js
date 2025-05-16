import axios from 'axios';

const handler = async (m, { conn, args, usedPrefix, command }) => {
    if (!args[0]) {
        await conn.reply(
            m.chat,
            `*Please enter a text prompt to generate an image with DALL-E (AI).*\n\n` +
            `*Example:*\n` +
            `- ${usedPrefix + command} crying kittens\n` +
            `- ${usedPrefix + command} A purple and blue cat on Jupiter, illuminating the cosmos with its charm in a minimalist style.`,
            m
        );
        return;
    }

    const prompt = args.join(' ');
    const apiUrl = `https://eliasar-yt-api.vercel.app/api/ai/text2img?prompt=${encodeURIComponent(prompt)}`;

    try {
        await m.react('⏳');
        await conn.sendMessage(m.chat, { text: '*⌛ Please wait a moment...*' }, { quoted: m });

        const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });

        await conn.sendMessage(m.chat, { image: Buffer.from(response.data) }, { quoted: m });
        await m.react('✅');

    } catch (error) {
        console.error('Error generating image:', error);
        await m.react('❌');
        await conn.reply(m.chat, '❌ Failed to generate the image. Please try again later.', m);
    }
};

handler.command = ['dalle'];
handler.help = ['dalle'];
handler.tags = ['ai'];
handler.limit = true
export default handler;
