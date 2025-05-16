import axios from 'axios';

let handler = async (m, { conn }) => {
    try {
        const apiUrl = `https://dog.ceo/api/breeds/image/random`;
        const response = await axios.get(apiUrl);
        const data = response.data;

        await conn.sendMessage(m.chat, { 
            image: { url: data.message }, 
            caption: 'Here is a random dog image! 🐶' 
        }, { quoted: m });
    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { text: `Error fetching dog image: ${e.message}` }, { quoted: m });
    }
};

handler.help = handler.command = ['dog'];
handler.tags = ['tools'];
handler.limit = true 
export default handler;
