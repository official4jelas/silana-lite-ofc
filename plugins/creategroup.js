//import { bold } from "chalk"
let handler = async (m, { conn, text }) => {
   
   if (!text) return m.reply('_Enter Group Name!_')
   try{
    m.reply(wait)
    let group = await conn.groupCreate(text, [m.sender])
    let link = await conn.groupInviteCode(group.gid)
    let url = 'https://chat.whatsapp.com/' + link;
 /// console.log(chalk.bold.red('Membuat Grup: ' + group.gid + '\nNama Grup: ' + text + '\n\nViolet'))
    m.reply('_Successfully Created Group *' + text + '*_\n\n*Name:* ' + text + '\n*ID:* ' + group.gid + '\n*Link:* ' + url)
       } catch (e) {
    m.reply(`Error`)
  }
}
handler.help = ['creategroup']
handler.tags = ['owner']
handler.command = /^(creategroup)$/
handler.owner = true
export default handler
