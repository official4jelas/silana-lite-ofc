import fetch from 'node-fetch';

let handler = async (m, { conn, text }) => {
    if (!text) return m.reply("Enter The YouTube URL please");
    await m.reply("_Wait....._");
    try {
        let z = await ytdl(text);
        await conn.sendMessage(m.chat, { audio: { url: z.videoUrl }, mimetype: "audio/mpeg" }, { quoted: m });
    } catch (e) {
        console.log(e);
        m.reply(`_Error Detected, Check this message Below_\n\n${e}`);
    }
}

handler.help = handler.command = ['ytmp3'];
handler.tags = ['downloader'];
handler.limit = true ;
handler.register = false;

export default handler;

async function ytdl(url) {
    if (!url.match(/youtu\.be|youtube\.com/i)) return { error: 'Invalid YouTube URL' };

    try {
        const headers = {
            "accept": "*/*",
            "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
            "sec-ch-ua": "\"Not A(Brand\";v=\"8\", \"Chromium\";v=\"132\"",
            "sec-ch-ua-mobile": "?1",
            "sec-ch-ua-platform": "\"Android\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "cross-site",
            "Referer": "https://id.ytmp3.mobi/",
            "Referrer-Policy": "strict-origin-when-cross-origin"
        };

        const initial = await fetch(`https://d.ymcdn.org/api/v1/init?p=y&23=1llum1n471&_=${Math.random()}`, { headers });
        const init = await initial.json();

        const id = url.match(/(?:youtu\.be\/|youtube\.com\/(?:.*v=|.*\/|.*embed\/))([^&?/]+)/)?.[1];
        if (!id) throw new Error('Failed to get video ID');

        const convertURL = init.convertURL + `&v=${id}&f=mp4&_=${Math.random()}`;
        const converts = await fetch(convertURL, { headers });
        const convert = await converts.json();

        let info = {};
        for (let i = 0; i < 5; i++) {
            await new Promise(resolve => setTimeout(resolve, 2000));
            const progressRes = await fetch(convert.progressURL, { headers });
            info = await progressRes.json();
            if (info.progress === 3) break;
        }

        if (!info.title || !convert.downloadURL) throw new Error('Conversion failed');

        return { videoUrl: convert.downloadURL, title: info.title };

    } catch (error) {
        console.error(error);
        return { error: error.message };
    }
}
