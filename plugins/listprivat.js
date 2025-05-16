import fs from "fs";

let handler = async (m, { conn }) => {
  let pc = Object.entries(await conn.chats); // Get all chats
  let niorg = pc.filter(([jid]) => jid.endsWith('@s.whatsapp.net')); // Filter only private chats
  let txt = '';

  // Generate the message text with names and tags
  for (let [jid] of niorg) {
    txt += `*⫹⫺ Name :* ${await conn.getName(jid)}\n*⫹⫺ Tag :* @${jid.replace(/@.+/, '')}\n\n`;
  }

  // Send the list as a message
  return conn.sendMessage(m.chat, {
    text: txt,
    contextInfo: {
      mentionedJid: conn.parseMention(txt),
      externalAdReply: {
        title: `List of Private Chats`,
        body: '',
        thumbnailUrl: "https://telegra.ph/file/b631d1d214b9443ab166f.jpg",
        sourceUrl: "",
        mediaType: 1,
        renderLargerThumbnail: true
      }
    }
  });
};

handler.help = ['listprivat'];
handler.tags = ['owner'];
handler.command = /^listpc|listprivat$/i;
handler.owner = true;
export default handler;
