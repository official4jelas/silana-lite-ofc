//plugin by noureddine_ouafy
//scrape by SxyzVerse thanks Brother 

import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs";
import { tmpdir } from "os";
import path from "path";

let handler = async (m, { conn }) => {
  try {
    // Check if URL is provided
    if (!m.text) throw new Error("Please provide an Instagram URL");

    // Extract URL from message
    const url = m.text.trim();

    // Validate URL
    if (!url.includes("instagram.com")) throw new Error("Invalid Instagram URL");

    // Instagram download function
    const igdl = async (u) => {
      let { data } = await axios.get(
        `https://snapdownloader.com/tools/instagram-downloader/download?url=${u}`,
        { timeout: 10000 }
      );
      let $ = cheerio.load(data);

      const result = {
        type: null,
        links: [],
      };

      // Check for video content
      const videoItems = $(".download-item").filter((i, el) => {
        return $(el).find(".type").text().trim().toLowerCase() === "video";
      });

      if (videoItems.length > 0) {
        result.type = "video";
        videoItems.find(".btn-download").each((i, el) => {
          const url = $(el).attr("href");
          if (url) result.links.push(url);
        });
      }

      // Check for photo content if no video found
      if (!result.type) {
        const photoLink = $(".profile-info .btn-download").attr("href");
        if (photoLink) {
          result.type = "photo";
          result.links.push(photoLink);
        }
      }

      // Fallback: Try to find any downloadable link if type is still null
      if (!result.type) {
        const anyDownloadLink = $("a.btn-download").attr("href");
        if (anyDownloadLink) {
          result.type = "media";
          result.links.push(anyDownloadLink);
        }
      }

      if (!result.links.length) {
        throw new Error(
          "Could not find downloadable content. The URL might be private, deleted, or unsupported by the downloader."
        );
      }

      return result;
    };

    // Execute download and send response
    const result = await igdl(url);

    if (result.type === "video" && result.links.length > 0) {
      const videoUrl = result.links[0]; // Use the first video link
      const tempPath = path.join(tmpdir(), `video_${Date.now()}.mp4`);

      // Download the video
      const response = await axios({
        method: "get",
        url: videoUrl,
        responseType: "stream",
        timeout: 30000, // 30-second timeout for downloading
      });

      // Save video to temporary file
      const writer = fs.createWriteStream(tempPath);
      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });

      // Send the video
      await conn.sendFile(m.chat, tempPath, "video.mp4", "تم تحميل الفيديو من إنستغرام!", m);

      // Clean up temporary file
      fs.unlink(tempPath, (err) => {
        if (err) console.error("Failed to delete temp file:", err);
      });
    } else {
      throw new Error("No video found to send. Only video content can be sent directly.");
    }
  } catch (error) {
    let errorMessage = error.message;
    if (error.message.includes("timeout")) {
      errorMessage = "Request timed out. Please try again later.";
    } else if (error.response) {
      errorMessage = `Failed to fetch content (Status: ${error.response.status}). The URL might be invalid or the service is down.`;
    }
    await conn.reply(m.chat, `Error: ${errorMessage}`, m);
  }
};

handler.help = ["instagramdl"];
handler.command = ["instagramdl"];
handler.tags = ["downloader"];
handler.limit = true;
export default handler;
