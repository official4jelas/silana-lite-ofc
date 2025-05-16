import axios from "axios";
import FormData from "form-data";
import fs from "fs";

let handler = async (m, { conn, args }) => {
    const quoted = m.quoted ? m.quoted : m;
    const mime = (quoted.msg || quoted).mimetype || '';
    
    if (!mime) return m.reply('Reply to an image with the caption .telegraph or send an image with the caption .telegraph');
    
    if (!/image\/(jpe?g|png)/.test(mime)) return m.reply('Only JPG and PNG image formats are supported');
       
    let img = await quoted.download();
    
    const tempFile = `./tmp/${Math.random().toString(36).substring(2)}.jpg`;
    fs.writeFileSync(tempFile, img);
    
    try {
        let form = new FormData();
        form.append("images", fs.createReadStream(tempFile));

        let headers = {
            headers: {
                ...form.getHeaders()
            }
        }

        let { data: uploads } = await axios.post("https://telegraph.zorner.men/upload", form, headers);
        
        if (uploads && uploads.links && uploads.links.length > 0) {
            const resultLink = `${uploads.links[0]}`;
            m.reply(resultLink);
        } else {
            m.reply('Upload failed');
        }
        
        fs.unlinkSync(tempFile);
    } catch (e) {
        m.reply(`${e.message}`);
        if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
    }
};

handler.help = ['telegraph'];
handler.tags = ['uploader'];
handler.command = /^(telegraph)$/i;
handler.limit = true;
export default handler;
