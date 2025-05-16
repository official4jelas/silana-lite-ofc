let handler = async (m, { text, conn }) => {
  
  if (!text || !text.includes('|')) {
    return await m.reply(']*Reminder feature 🥹🌟*\n~Example: .reminder Study|10~\n> .reminder [message]|[minutes]\n\n by obito thanks 🙏');
  }

  let [message, time] = text.split('|');

  time = parseInt(time);
  if (isNaN(time) || time <= 0) {
    return await m.reply('`Please provide a valid time in minutes as a number 😆😄😑`');
  }

  let delay = time * 60 * 1000;

  await m.reply(`*⏣━ ━─━━𖥻⟬⚡⟭𖥻━━─━ ━⏣*\n*Reminder set successfully 🙂💀 ⇩⇩*\n> Reminder: "${message}" in ${time} minutes 🍎💥`);

  setTimeout(async () => {
    await m.reply(message);
  }, delay);
};

handler.command = ['reminder'];
handler.help = ['reminder'];
handler.tags = ['tools'];

export default handler;
