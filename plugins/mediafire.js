import axios from 'axios';

let handler = async (m, {conn, text}) => {
    if (!text) return m.reply('من فضلك أدخل رابط');
    if (!text.includes('http')) return m.reply('من فضلك أدخل رابط صحيح');
    
    try {
        const resmf = await axios.get('https://api.siputzx.my.id/api/d/mediafire?url=' + encodeURIComponent(text));
        m.reply('بدء التنزيل...');
        conn.sendFile(m.chat, resmf.data.data.downloadLink, resmf.data.data.downloadLink.split('/').pop(),
            `الاسم: ${resmf.data.data.fileName}
            الحجم: ${resmf.data.data.fileSize}
            النوع: ${resmf.data.data.downloadLink.split('.').pop()}`, m);
    } catch (error) {
        m.reply('حدث خطأ أثناء المعالجة');
    }
}

handler.help = handler.command = ['mediafire']
handler.tags = ['downloader']
handler.limit = true 
export default handler;
