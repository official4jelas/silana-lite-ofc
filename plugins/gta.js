import fetch from 'node-fetch';

const API_KEY = "RyAPI";

let handler = async (m, { conn, args, usedPrefix, command }) => {
  try {
    // Parse the user input into two texts separated by "|"
    let teks = args.join(" ").split("|");
    if (!teks[0] || !teks[1]) {
      return m.reply(`Enter the text!\n\nExample:\n${usedPrefix + command} Silana|Ai`);
    }

    // Construct the API URL
    let url = `https://api.lolhuman.xyz/api/gtapassed?apikey=${API_KEY}&text1=${encodeURIComponent(teks[0])}&text2=${encodeURIComponent(teks[1])}`;

    // Fetch the image result
    let response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch from API");

    // Send the image to the chat
    let buffer = await response.buffer();
    await conn.sendFile(m.chat, buffer, "result.jpg", "✅ Silana Ai", m, false);
  } catch (error) {
    console.error(error);
    await m.reply("An error occurred while processing your request.");
  }
};

handler.help = ["gta"];
handler.tags = ["tools"];
handler.command = /^(gta)$/i;
handler.limit = true;
handler.error = 0;
export default handler;
