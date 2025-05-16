import axios from "axios";
import getNewProxy from "../lib/proxylist.js";

async function tiktokTranscript(url) {
  const { ip, port } = await getNewProxy();
  
  try {
    const { data } = await axios.get(
      `https://scriptadmin.tokbackup.com/v1/tiktok/fetchTikTokData?video=${url}&get_transcript=true&ip=${ip}`,
      {
        headers: {
          "X-Api-Key": "Toktools2024@!NowMust",
          "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Mobile Safari/537.36",
          "Accept": "application/json, text/plain, */*",
          "Accept-Language": "en-US,en;q=0.9",
          "Referer": "https://script.tokaudit.io/",
          "Origin": "https://script.tokaudit.io",
          "Sec-Ch-Ua": '"Not A(Brand)";v="8", "Chromium";v="132"',
          "Sec-Ch-Ua-Mobile": "?1",
          "Sec-Ch-Ua-Platform": "Android",
          "Sec-Fetch-Dest": "empty",
          "Sec-Fetch-Mode": "cors",
          "Sec-Fetch-Site": "cross-site"
        }
      }
    );
    
    return data;
  } catch (error) {
    console.error("Error fetching TikTok transcript:", error);
    throw error;
  }
}

let handler = async (m, { conn, text }) => {
  if (!text) {
    return m.reply("Please provide a TikTok URL.");
  }

  try {
    const result = await tiktokTranscript(text);
    if (!result || !result.subtitles) {
      return m.reply("Could not retrieve transcript.");
    }

    await m.reply(`TikTok Transcript:\n\n${result.subtitles}`);
  } catch (error) {
    console.error(error);
    await m.reply("An error occurred while fetching the transcript.");
  }
};

handler.help = ["tiktok-transcript"];
handler.command = /^(tiktok-transcript)$/i;
handler.tags = ["tools"];
handler.limit = true 
export default handler;
