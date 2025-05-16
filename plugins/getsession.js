import fs from 'fs';

let handler = async (m, { conn, text }) => {
    m.reply('لحظة سوف يتم تلبية طلبكم');

    // Read the content of creds.json
    let sesi = await fs.readFileSync('./sessions/creds.json', 'utf-8');
    
    // Send the content of creds.json as text
    await conn.sendMessage(m.chat, { text: sesi }, { quoted: m });

    // Send the creds.json file as a document
    return await conn.sendMessage(m.chat, { document: Buffer.from(sesi), mimetype: 'application/json', fileName: 'creds.json' }, { quoted: m });
}

handler.help = ['getsession'];
handler.tags = ['owner'];
handler.command = /^getsession$/i;

handler.rowner = true;

export default handler;
