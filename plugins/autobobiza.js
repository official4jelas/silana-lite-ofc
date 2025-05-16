import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    conn.chiori = conn.chiori || {};

    if (!text) throw `*• Example :* ${usedPrefix + command} *[on/off]*`;

    let phoneNumber = m.sender.split('@')[0];

    if (text === "on") {
        conn.chiori[phoneNumber] = {
            messages: [],
        };
        m.reply("[ ✓ ] Successfully created a chat session");
    } else if (text === "off") {
        delete conn.chiori[phoneNumber];
        m.reply("[ ✓ ] Successfully deleted the chat session");
    }
};

handler.before = async (m, { conn }) => {
    conn.chiori = conn.chiori || {};
    if (m.isBaileys && m.fromMe) return;
    if (!m.text) return;

    let phoneNumber = m.sender.split('@')[0];

    if (!conn.chiori[phoneNumber]) return;

    if (
        m.text.startsWith(".") ||
        m.text.startsWith("#") ||
        m.text.startsWith("!") ||
        m.text.startsWith("/") ||
        m.text.startsWith("\\/")
    )
        return;

    if (conn.chiori[phoneNumber] && m.text) {
        let name = conn.getName(m.sender);

        try {
            let systemPrompt = "Customize your prompt here!";

            const response = await fetch(`https://api.agatz.xyz/api/gptlogic?logic=${systemPrompt}&p=${m.text}`);

            if (response.ok) {
                const data = await response.json();
                const result = data.data.result;
                conn.reply(m.chat, result, m);
                conn.chiori[phoneNumber].messages = data.messages || [];
            } else {
                m.reply("Error: Unable to fetch response from the API.");
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }
};

handler.command = ["autobobiza"];
handler.tags = ["ai"];
handler.help = ["autobobiza"];
handler.limit = true 
export default handler;
