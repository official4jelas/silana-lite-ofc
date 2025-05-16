/*
 • Feature By Anomaki Team
 • Created by: xyzan code
 • Share text *(Plugins)*
 • Do not remove watermark
*/

import axios from 'axios';

const handler = async (m, {
    conn,
    text
}) => {
    if (!text) throw 'Please provide the text you want to share...';

    try {
        const link = await createLink(text);
        await conn.reply(m.chat, `Here’s your text link: ${link}`, m);
    } catch (e) {
        await conn.reply(m.chat, `Oops, there was an error: ${e}`, m);
    }
};

handler.help = ['sharetext'];
handler.tags = ['tools'];
handler.command = /^(sharetext)$/i;
handler.limit = true;
export default handler;

const createLink = async (text) => {
    const { data } = await axios.post('https://sharetext.io/api/text', {
        text: text
    }, {
        headers: {
            'User-Agent': 'Mozilla/5.0',
            'Referer': 'https://sharetext.io/'
        }
    });

    if (!data) throw 'Failed to create link';
    return `https://sharetext.io/${data}`;
};
