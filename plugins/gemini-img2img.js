import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";

const API_KEY = "your gemini apikey";

let handler = async (m, { conn, args, text, usedPrefix, command }) => {
  let q = m.quoted ? m.quoted : m;
  let mime = (q.msg || q).mimetype || "";

  if (!text) return m.reply("Please provide a text prompt.");
  if (!mime) return m.reply(`Send/reply to an image with the caption *${usedPrefix + command}*`);
  if (!/image\/(jpe?g|png)/.test(mime)) return m.reply(`Format ${mime} is not supported! Only jpeg/jpg/png`);

  m.reply("Please wait...");

  try {
    let imgData = await q.download();
    let genAI = new GoogleGenerativeAI(API_KEY);

    const base64Image = imgData.toString("base64");

    const contents = [
      { text },
      {
        inlineData: {
          mimeType: mime,
          data: base64Image
        }
      }
    ];

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp-image-generation",
      generationConfig: {
        responseModalities: ["Text", "Image"]
      },
    });

    const response = await model.generateContent(contents);

    let resultImage;
    let resultText = "";

    for (const part of response.response.candidates[0].content.parts) {
      if (part.text) {
        resultText += part.text;
      } else if (part.inlineData) {
        const imageData = part.inlineData.data;
        resultImage = Buffer.from(imageData, "base64");
      }
    }

    if (resultImage) {
      const tempPath = path.join(process.cwd(), "tmp", `gemini_${Date.now()}.png`);
      fs.writeFileSync(tempPath, resultImage);

      await conn.sendMessage(m.chat, { 
        image: { url: tempPath },
        caption: `Image Transformation Result`
      }, { quoted: m });

      setTimeout(() => {
        try {
          fs.unlinkSync(tempPath);
        } catch {}
      }, 30000);
    } else {
      m.reply("Failed to process the image.");
    }
  } catch (error) {
    console.error(error);
    m.reply(`Error: ${error.message}`);
  }
};

handler.help = ["gemini-img2img"];
handler.tags = ["ai"];
handler.command = ["gemini-img2img"];
handler.limit = true
export default handler;
