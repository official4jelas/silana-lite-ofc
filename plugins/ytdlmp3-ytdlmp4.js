//THANKS siputzx 
import axios from 'axios';
import FormData from 'form-data';

let handler = async (m, { conn, args }) => {
  try {
    // Determine format based on command used
    const isAudio = m.text.startsWith('.ytdlmp3');
    const format = isAudio ? 'mp3' : 'mp4';
    
    // Check if URL is provided
    if (!args[0]) {
      return m.reply(`Please provide a YouTube URL after the command.\nExample:\n.ytdlmp4 https://youtube.com/watch?v=...\n.ytdlmp3 https://youtube.com/watch?v=...`);
    }
    
    const url = args[0];  
    
    m.reply('Processing, please wait...');  
    
    const videoData = await getVideoData(url, format);  
    
    await conn.sendMessage(m.chat, {  
      text: `*Title:* ${videoData.title}\n*Duration:* ${videoData.duration}\n*Format:* ${format.toUpperCase()}`,  
      contextInfo: {  
        externalAdReply: {  
          title: videoData.title,  
          body: `Click to download ${format.toUpperCase()}`,  
          thumbnailUrl: videoData.thumbnail,  
          sourceUrl: videoData.download_url,  
          mediaType: 1  
        }  
      }  
    });  
    
    await conn.sendMessage(m.chat, {   
      [isAudio ? 'audio' : 'video']: {   
        url: videoData.download_url   
      },   
      mimetype: isAudio ? 'audio/mpeg' : 'video/mp4',  
      caption: `${format.toUpperCase()} download completed`  
    }, { quoted: m });

  } catch (error) {
    m.reply(`Error: ${error.message}`);
  }
}

async function getVideoData(url, format = 'mp4') {
  try {
    const formDataInfo = new FormData();
    formDataInfo.append('url', url);

    const { data: info } = await axios.post('https://ytdown.siputzx.my.id/api/get-info', formDataInfo, {  
      headers: { ...formDataInfo.getHeaders() }  
    });  

    const dl = new FormData();  
    dl.append('id', info.id);  
    dl.append('format', format);  
    dl.append('info', JSON.stringify(info));  

    const { data } = await axios.post('https://ytdown.siputzx.my.id/api/download', dl, {  
      headers: { ...dl.getHeaders() }  
    });  

    if (!data.download_url) {  
      throw new Error('Failed to get download link.');  
    }  

    return {  
      id: info.id,  
      title: info.title,  
      type: info.type,  
      album: info.album,  
      artist: info.artist,  
      description: info.description,  
      duration: info.duration,  
      upload_date: info.upload_date,  
      like_count: info.like_count,  
      view_count: info.view_count,  
      tags: info.tags,  
      thumbnail: info.thumbnail,  
      download_url: `https://ytdown.siputzx.my.id${data.download_url}`,  
    };

  } catch (error) {
    throw new Error(`Failed to fetch video data: ${error.message}`);
  }
}

handler.help = ['ytdlmp4', 'ytdlmp3'];
handler.command = /^(ytdlmp4|ytdlmp3)$/i;
handler.tags = ['downloader'];
handler.limit = true;
export default handler;
