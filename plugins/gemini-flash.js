import axios from "axios";
import FormData from "form-data";

async function gemini(question) {
    let d = new FormData();
    d.append("content", `User: ${question}`);
    d.append("model", "@google/gemini-2.0-flash-exp");

    let head = {
        headers: {
            ...d.getHeaders()
        }
    };

    let { data: ak } = await axios.post("https://mind.hydrooo.web.id/v1/chat", d, head);
    return ak.result;
}

let handler = async (m, { args }) => {
    if (!args[0]) return m.reply("❌ | المرجو إدخال السؤال.");

    try {
        let response = await gemini(args.join(" "));
        m.reply(`🤖 | الرد:\n${response}`);
    } catch (error) {
        console.error(error);
        m.reply("❌ | حدث خطأ أثناء جلب الرد، حاول مرة أخرى لاحقًا.");
    }
};

handler.help = ["gemini-flash"];
handler.tags = ["ai"];
handler.command = /^gemini-flash$/i;
handler.limit = true
export default handler;
