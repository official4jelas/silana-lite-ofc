import axios from 'axios';
import cheerio from 'cheerio';

async function cariGC(query) {
    try {
        const { data } = await axios.get(`https://groupsor.link/group/searchmore/${query.replace(/ /g, "-")}`);
        const $ = cheerio.load(data);
        const result = [];

        $(".maindiv").each((i, el) => {
            result.push({
                title: $(el).find("img").attr("alt")?.trim(),
                thumb: $(el).find("img").attr("src")?.trim(),
            });
        });

        $("div.post-info-rate-share > .joinbtn").each((i, el) => {
            if (result[i]) {
                result[i].link = $(el).find("a").attr("href")?.trim().replace("https://groupsor.link/group/join/", "https://chat.whatsapp.com/");
            }
        });

        $(".post-info").each((i, el) => {
            if (result[i]) {
                result[i].desc = $(el).find(".descri").text()?.replace("... continue reading", ".....").trim();
            }
        });

        return result;
    } catch (e) {
        console.error("❌ Error fetching WhatsApp groups:", e);
        return [];
    }
}

let handler = async (m, { conn, text }) => {
    if (!text) return m.reply("⚠️ *الرجاء إدخال كلمة البحث عن مجموعات واتساب*");

    try {
        m.reply("🔍 *جاري البحث عن مجموعات واتساب، الرجاء الانتظار...*");

        let results = await cariGC(text);
        if (!results.length) return m.reply("❌ *لم يتم العثور على مجموعات تطابق البحث*");

        let message = `📌 *نتائج البحث عن:* ${text}\n\n`;
        results.slice(0, 5).forEach((group, i) => {
            message += `*${i + 1}. ${group.title}*\n🔗 *رابط:* ${group.link}\n📝 *الوصف:* ${group.desc || "لا يوجد"}\n\n`;
        });

        m.reply(message);
    } catch (e) {
        console.error(e);
        m.reply("❌ *حدث خطأ أثناء البحث عن المجموعات*");
    }
};

handler.help = ['whatsappgroup'];
handler.tags = ['search'];
handler.command = ['whatsappgroup'];
handler.limit = true 
export default handler;
