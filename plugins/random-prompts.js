import axios from "axios";

let handler = async (m, { conn }) => {
    try {
        let p = {
            content: m.text, // Using the message text as the prompt
            op: "op-prompt"
        };

        let headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
            "Accept": "application/json, text/plain, */*",
            "Accept-Language": "en-US,en;q=0.9",
            "Content-Type": "application/json",
            "Origin": "https://junia.ai",
            "Referer": "https://junia.ai/",
            "Connection": "keep-alive",
            "Sec-Fetch-Site": "same-site",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Dest": "empty",
            "Sec-Ch-Ua": '"Chromium";v="123", "Not:A-Brand";v="8"',
            "Sec-Ch-Ua-Mobile": "?0",
            "Sec-Ch-Ua-Platform": '"Windows"'
        };

        let { data } = await axios.post("https://api-v1.junia.ai/api/free-tools/generate", p, {
            headers
        });

        // Send the response back through the connection
        await conn.reply(m.chat, data, m);
    } catch (error) {
        await conn.reply(m.chat, `Error: ${error.message}`, m);
    }
}

handler.help = ['random-prompts']
handler.command = ['random-prompts']
handler.tags = ['tools']
handler.limit = true 
export default handler
