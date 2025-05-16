import axios from "axios";
import FormData from "form-data";
import * as cheerio from "cheerio";

class InstagramDownloader {
  static async getCookieAndToken() {
    try {
      const response = await axios.get("https://kol.id/download-video/instagram", {
        headers: { "User-Agent": "Mozilla/5.0" }
      });

      const cookies = response.headers["set-cookie"]
        ?.map(cookie => cookie.split(";")[0])
        .join("; ") || "";
      
      const $ = cheerio.load(response.data);
      const token = $("input[name='_token']").val();

      return { cookies, token };
    } catch (error) {
      throw new Error(`Failed to get cookies and token: ${error.message}`);
    }
  }

  static async download(url) {
    try {
      const { cookies, token } = await this.getCookieAndToken();
      
      const formData = new FormData();
      formData.append("url", url);
      formData.append("_token", token);

      const headers = {
        "X-Requested-With": "XMLHttpRequest",
        "Cookie": cookies,
        ...formData.getHeaders()
      };

      const { data } = await axios.post(
        "https://kol.id/download-video/instagram",
        formData,
        { headers }
      );

      return this.parseResponse(data.html);
    } catch (error) {
      throw new Error(`Failed to download content: ${error.message}`);
    }
  }

  static parseResponse(html) {
    const $ = cheerio.load(html);
    const result = {
      title: $("#title-content-here h2").text().trim(),
      media: {}
    };

    const videoUrl = $(".btn-instagram.btn-primary").attr("href");
    if (videoUrl) {
      result.media = {
        type: "video",
        url: videoUrl
      };
    } else {
      const images = [];
      $(".dropdown-menu .dropdown-item").each((i, el) => {
        const imgUrl = $(el).attr("href");
        if (imgUrl) images.push(imgUrl);
      });

      result.media = images.length > 0 
        ? { type: "image", urls: images } 
        : { type: "unknown", urls: [] };
    }

    return result;
  }
}

let handler = async (m, { conn, args }) => {
  if (!args[0]) return m.reply("🚫 الرجاء إدخال رابط Instagram لتنزيل المحتوى.");

  try {
    const result = await InstagramDownloader.download(args[0]);

    if (result.media.type === "video") {
      await conn.sendMessage(m.chat, { video: { url: result.media.url }, caption: result.title }, { quoted: m });
    } else if (result.media.type === "image") {
      for (let img of result.media.urls) {
        await conn.sendMessage(m.chat, { image: { url: img }, caption: result.title }, { quoted: m });
      }
    } else {
      m.reply("❌ لم يتم العثور على أي محتوى قابل للتنزيل.");
    }
  } catch (error) {
    m.reply(`⚠️ حدث خطأ أثناء التنزيل: ${error.message}`);
  }
};

handler.help = handler.command = ["igdl"];
handler.tags = ["downloader"];
export default handler;
