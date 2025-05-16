//scrape by Sxyz
//plugin by Noureddine ouafy 
import axios from "axios";
import FormData from "form-data";
import * as cheerio from "cheerio";

const likeeDl = {
    base: {
        download: "https://getof.net/wp-json/aio-dl/video-data/",
        token: "https://getof.net/en/likee-video-downloader/"
    },
    hash: (url, salt) => {
        return btoa(url) + (url.length + 1_000) + btoa(salt);
    },
    token: async () => {
        try {
            let { data } = await axios.get(likeeDl.base.token);
            let $ = cheerio.load(data);
            let token = $("#token").val();
            if (!token) throw new Error('No token found in page');
            return token;
        } catch (e) {
            throw new Error(`Token fetch failed: ${e.message}`);
        }
    },
    download: async (url) => {
        try {
            let hashh = await likeeDl.hash(url, "aio-dl");
            let tkns = await likeeDl.token();
            let d = new FormData();
            d.append("url", url);
            d.append("token", tkns);
            d.append("hash", hashh);
            let headers = {
                headers: {
                    ...d.getHeaders()
                }
            };
            let { data: download } = await axios.post(likeeDl.base.download, d, headers);
            return download;
        } catch (e) {
            throw new Error(`Download request failed: ${e.message}`);
        }
    }
}

let handler = async (m, {conn}) => {
    try {
        if (!m.text) throw new Error('Please provide a Likee video URL');
        
        const url = m.text.split(' ')[1];
        if (!url || !url.includes('likee.video')) {
            throw new Error('Please provide a valid Likee video URL \n ex : *.likeedl* https://l.likee.video/v/6qW3uQ');
        }

        // Send initial message to indicate processing
        await conn.reply(m.chat, 'Downloading video, please wait...', m);

        const result = await likeeDl.download(url);
        
        if (result && result.medias && result.medias.length > 0) {
            const media = result.medias[0]; // Get first media option
            const caption = 
                `Title: ${result.title || 'No title available'}\n` +
                `Quality: ${media.quality || 'N/A'}\n` +
                `Size: ${media.formattedSize || 'Unknown'}`;
            
            // Send the video file directly
            await conn.sendFile(
                m.chat,
                media.url,
                'video.mp4',
                caption,
                m
            );
        } else {
            throw new Error(`No downloadable media found in response: ${JSON.stringify(result)}`);
        }
        
    } catch (error) {
        await conn.reply(m.chat, `Error: ${error.message}`, m);
    }
}

handler.help = ['likeedl']
handler.command = ['likeedl']
handler.tags = ['downloader']
handler.limit = true 
export default handler
