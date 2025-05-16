import axios from 'axios';

const api = axios.create({
    baseURL: 'https://luminai.my.id',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Axios-Instance/1.0',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'X-Requested-With': 'XMLHttpRequest',
        'Accept-Encoding': 'gzip, deflate, br',
    },
});

/**
 * Sends a request to generate an image based on provided content.
 * @param {string} content - The content to use for generating the image.
 * @returns {Promise<string>} The URL of the generated image.
 */
async function imageCreator(content) {
    const payload = {
        content,
        cName: 'ImageGenerationLV45LJp',
        cID: 'ImageGenerationLV45LJp',
    };

    try {
        const response = await api.post('/', payload);
        const urlRegex = /https:\/\/storage\.googleapis\.com\/[^\s")]+/;
        const imageUrlMatch = urlRegex.exec(JSON.stringify(response.data.result));
        return imageUrlMatch[0];
    } catch (error) {
        throw new Error(error.response ? error.response.data : error.message);
    }
}

let handler = async (m, { conn, text }) => {
    if (!text) {
        return conn.reply(m.chat, 'Please provide the content to generate an image.', m);
    }

    try {
        const imageUrl = await imageCreator(text);
        await conn.sendMessage(m.chat, { image: { url: imageUrl }, caption: `Here is your generated image for: ${text}` });
    } catch (error) {
        await conn.reply(m.chat, `Error: ${error.message}`, m);
    }
};

handler.help = ['generateimage'];
handler.command = ['generateimage'];
handler.tags = ['ai'];
handler.limit = true 
export default handler;
