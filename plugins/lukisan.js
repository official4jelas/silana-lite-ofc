// instagram.com/noureddine_ouafy

import axios from "axios";
import * as cheerio from "cheerio";
import FormData from "form-data";

let handler = async (m, { conn, text }) => {
  if (!text) return m.reply("المرجو كتابة وصف للصورة التي تريد توليدها بأسلوب لوحة.");

  let images = await generateImageStyleLukisan(text);
  if (!images.length) return m.reply("لم يتم العثور على أي صور. حاول بوصف مختلف.");

  for (let img of images) {
    await conn.sendFile(m.chat, img.img, "lukisan.jpg", "ها هي الصورة اللي طلبتي:", m);
  }
};

handler.help = handler.command = ['lukisan'];
handler.tags = ['ai'];
handler.limit = true 
export default handler;

async function generateImageStyleLukisan(prmpt) {
  let d = new FormData();
  d.append("qq", prmpt);

  let headers = {
    headers: {
      ...d.getHeaders()
    }
  };

  let { data: ress } = await axios.post("https://1010clipart.com/", d, headers);
  let $ = cheerio.load(ress);

  let images = [];
  $('#image-container img').each((i, el) => {
    let src = $(el).attr('src');
    if (src) images.push({ img: src });
  });

  return images;
}
