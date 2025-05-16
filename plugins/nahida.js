import axios from 'axios';

let handler = async (m, { conn, text, prefix, command }) => {
    if (!text) {
        return m.reply(`Example: ${prefix + command} Enter your text!`);
    }

    try {
        const response = await axios.get(`https://api.agatz.xyz/api/voiceover?text=${encodeURIComponent(text)}&model=nahida`);

        if (response.data.status === 200) {
            const audioUrl = response.data.data.oss_url;

            // Send the audio as a voice note
            await conn.sendMessage(m.chat, {
                audio: { url: audioUrl },
                mimetype: 'audio/mpeg',
                ptt: true // Set as a voice note
            }, { quoted: m });
        } else {
            return m.reply('⚠️ An error occurred while converting text to voice.');
        }
    } catch (error) {
        return m.reply('⚠️ An error occurred while contacting the API.');
    }
};

handler.help = ['nahida'];
handler.tags = ['ai'];
handler.command = ['nahida'];
handler.limit = true
export default handler;
