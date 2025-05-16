// @noureddine_ouafy
import fs from "fs";
import { fileTypeFromBuffer } from "file-type"; // Updated import for file-type v17+
import axios from "axios";
import qs from "qs";

const tools = ["removebg", "enhance", "upscale", "restore", "colorize"];

const pxpic = {
  upload: async (buffer) => {
    const { ext, mime } = (await fileTypeFromBuffer(buffer)) || {}; // Updated to fileTypeFromBuffer
    const fileName = `${Date.now()}.${ext}`;
    const folder = "uploads";

    const response = await axios.post("https://pxpic.com/getSignedUrl", { folder, fileName }, {
      headers: { "Content-Type": "application/json" },
    });

    const { presignedUrl } = response.data;
    await axios.put(presignedUrl, buffer, { headers: { "Content-Type": mime } });

    const cdnDomain = "https://files.fotoenhancer.com/uploads/";
    return cdnDomain + fileName;
  },

  create: async (buffer, selectedTool) => {
    if (!tools.includes(selectedTool)) {
      return `Please choose one of these tools: ${tools.join(", ")}`;
    }

    const url = await pxpic.upload(buffer);
    const data = qs.stringify({
      imageUrl: url,
      targetFormat: "png",
      needCompress: "no",
      imageQuality: "100",
      compressLevel: "6",
      fileOriginalExtension: "png",
      aiFunction: selectedTool,
      upscalingLevel: "",
    });

    const config = {
      method: "POST",
      url: "https://pxpic.com/callAiFunction",
      headers: {
        "User-Agent": "Mozilla/5.0 (Android 10; Mobile; rv:131.0) Gecko/131.0 Firefox/131.0",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/png,image/svg+xml,*/*;q=0.8",
        "Content-Type": "application/x-www-form-urlencoded",
        "accept-language": "en-US",
      },
      data,
    };

    const api = await axios.request(config);
    return api.data;
  },
};

const handler = async (m, { conn, usedPrefix, command }) => {
  conn.enhancer = conn.enhancer || {};

  const q = m.quoted ? m.quoted : m;
  const mime = (q.msg || q).mimetype || "";

  if (!mime) {
    return conn.reply(m.chat, `*Example:* .hd-img  *[Reply to an image or send an image with the caption .hd-img]*`, m, adReply);
  }

  if (!/image\/(jpe?g|png)/.test(mime)) {
    return conn.reply(m.chat, `Mime type ${mime} is not supported. Only JPG and PNG are supported.`, m, adReply);
  }

  if (m.sender in conn.enhancer) {
    return conn.reply(m.chat, "Please wait! Your previous HD request is still being processed.", m, adReply);
  }

  conn.enhancer[m.sender] = true;

  conn.reply(m.chat, "Processing, please wait...", m, adReply);

  try {
    const media = await q.download();
    const result = await pxpic.create(media, "enhance");
    if (!result.resultImageUrl) throw new Error("Failed to process the image.");

    await conn.sendFile(m.chat, result.resultImageUrl, "", "Here you go!", m);
  } catch (error) {
    console.error("Error:", error);
    await m.reply("An error occurred while processing the image.");
  } finally {
    delete conn.enhancer[m.sender];
  }
};

handler.help = ["hd-img"];
handler.tags = ["tools"];
handler.command = ["hd-img"];
handler.limit = true 
export default handler;
