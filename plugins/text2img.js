import fetch from "node-fetch";

const handler = async (m, { conn, text, usedPrefix, command }) => {
  let user = global.db.data.users[m.sender];
  if (user.isLoadingAnimeDif) {
    await m.reply("⏱️ In progress, please wait until it's finished.");
    return;
  }
  if (!text) {
    throw `This command generates images from text prompts.\n\nExample usage:\n${usedPrefix + command} a girl with glasses`;
  }
  user.isLoadingAnimeDif = true;
  await m.reply("⏱️ Please wait...");

  const apiCombinations = [
    `https://api.ryzendesu.vip/api/ai/flux-diffusion?prompt=${encodeURIComponent(text)}`,
    `https://api.ryzendesu.vip/api/ai/flux-schnell?prompt=${encodeURIComponent(text)}`,
    `https://apidl.asepharyana.my.id/api/ai/flux-diffusion?prompt=${encodeURIComponent(text)}`,
    `https://apidl.asepharyana.my.id/api/ai/flux-schnell?prompt=${encodeURIComponent(text)}`
  ];

  for (let i = 0; i < apiCombinations.length; i++) {
    try {
      let response = await fetch(apiCombinations[i]);
      let imageBuffer = await response.buffer();
      await conn.sendFile(m.chat, imageBuffer, 'image.jpg', '', m); // Removed watermark
      break;
    } catch (error) {
      console.log(`URL ${apiCombinations[i]} failed:`, error);
      if (i === apiCombinations.length - 1) {
        conn.reply(m.chat, 'All API URLs failed. Please try again later.', m);
        return;
      }
    } finally {
      user.isLoadingAnimeDif = false;
    }
  }
};

handler.help = ['text2img'];
handler.tags = ['ai'];
handler.command = /^(text2img)$/i;
handler.limit = true;
export default handler;
