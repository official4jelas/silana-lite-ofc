/*
`PLUGIN SEND MESSAGE TO CHANNEL`
Note:
This plugin sends a message to a specified WhatsApp channel.
*/

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) throw(`Example:\n${usedPrefix}${command} Hello?`);
    conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

    // ENTER CHANNEL ID HERE
    let idch = '120363377578749872@newsletter';
    //. ADD YOUR CHANNEL ID ABOVE 👆👆
    
    let who = m.sender;
    let username = conn.getName(who);

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
    m.reply('Your message has been sent. Please check your channel.');
    
    let url = await conn.profilePictureUrl(who, 'image');
    
    await conn.sendMessage(`${idch}`, {
        text: `${text}`,
        contextInfo: {
            externalAdReply: {
                title: `Message from ${username}`,
                body: 'message to channel',
                thumbnailUrl: `${url}`,
                sourceUrl: 'https://whatsapp.com/channel/0029VaX4b6J7DAWqt3Hhu01A',
                mediaType: 1,
                renderLargerThumbnail: false,
                showAdAttribution: true
            }
        }
    });
};

handler.command = /^(msg-to-channel)$/i;
handler.help = ['msg-to-channel'];
handler.tags = ['owner'];
handler.owner = true;
export default handler;
