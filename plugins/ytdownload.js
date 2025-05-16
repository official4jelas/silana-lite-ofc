//plugin by noureddineouafy 
//scrape by Seaavey (THANKS bro)

import axios from "axios"
// Function to download YouTube media (audio or video)
const Download_YT = async (url, type = "audio") => {
  try {
    let payload = {
      height: type === "audio" ? 0 : 360,
      media_type: type,
      url
    };
    const { task_id } = await axios.post(`https://api.grabtheclip.com/submit-download`, payload).then(res => res.data);

    while (true) {
      const response = await axios.get(`https://api.grabtheclip.com/get-download/${task_id}`).then(res => res.data);

      if (response.status === "Success") {
        return response;
      } else if (response.status === "Failed") {
        console.error(response.result?.error);
        return undefined;
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  } catch (error) {
    console.error("Error fetching download:", error);
    return undefined;
  }
};

// Main handler for the plugin
let handler = async (m, { conn }) => {
  try {
    // Extract command and arguments from message text, accounting for prefix
    const text = m.text.trim();
    const [commandWithPrefix, ...args] = text.split(" ");
    
    // Remove the prefix (e.g., '.' or '/') and get the command
    const command = commandWithPrefix.replace(/^[./]/, "").toLowerCase();
    const url = args[0]; // First argument is the URL
    const type = args[1] || "audio"; // Default to audio if no type specified

    // Handle only .ytdownload command
    if (command === "ytdownload") {
      if (!url) {
        return conn.reply(m.chat, "Please provide a YouTube URL. Usage: .ytdownload <url> [audio|video]", m);
      }
      if (type !== "audio" && type !== "video") {
        return conn.reply(m.chat, "Invalid type. Use 'audio' or 'video'. Usage: .ytdownload <url> [audio|video]", m);
      }

      await conn.reply(m.chat, `Downloading ${type}, please wait...`, m);
      const download = await Download_YT(url, type);
      if (!download) {
        return conn.reply(m.chat, "Failed to download the media.", m);
      }

      // Assuming download.result contains the media URL
      if (!download.result || !download.result.url) {
        return conn.reply(m.chat, `No media URL found in the response. Response: ${JSON.stringify(download, null, 2)}`, m);
      }

      // Send the media file (video or audio)
      await conn.sendFile(
        m.chat,
        download.result.url,
        `${type === "audio" ? "audio.mp3" : "video.mp4"}`,
        `Here is your ${type}!`,
        m
      );
    }
  } catch (error) {
    console.error("Error in handler:", error);
    await conn.reply(m.chat, "An error occurred while processing the request.", m);
  }
};

// Plugin metadata
handler.help = ["ytdownload"];
handler.command = ["ytdownload"];
handler.tags = ["downloader"];
handler.limit = true;
export default handler;
