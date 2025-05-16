//plugin by @noureddine_ouafy 
//scrape by JazxCode

import axios from 'axios';
import cheerio from 'cheerio';

let handler = async (m, { conn }) => {
  // Check if the user has written the command without a link
  if (!m.text.trim()) {
    // Send explanation to the user when they first use the command
    await m.reply('This command is for downloading videos from links. \n\n To use it, type `.twitter` followed by the video link, like: `.twitter https://x.com/Indomielovers/status/1917826490068279736`');
    return;
  }

  // Extract the URL sent by the user
  const url = m.text.trim().split(' ')[1];

  if (!url) {
    await m.reply('Please provide a valid link after the command, like: `.twitter https://x.com/Indomielovers/status/1917826490068279736`');
    return;
  }

  // Function to fetch download links
  const pler = async (url) => {
    try {
      const response = await axios.post('https://twmate.com/', new URLSearchParams({
        page: url,
        ftype: 'all',
        ajax: '1'
      }), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'Accept': '*/*',
          'X-Requested-With': 'XMLHttpRequest',
          'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Mobile Safari/537.36',
          'Referer': 'https://twmate.com/',
        }
      });
      const $ = cheerio.load(response.data);
      const videoLinks = [];
      $('.btn-dl').each((index, element) => {
        const quality = $(element).parent().prev().text().trim();  
        const downloadUrl = $(element).attr('href');
        videoLinks.push({ quality, downloadUrl });
      });

      return videoLinks;

    } catch (error) {
      console.error('Error while fetching video data:', error);
    }
  }

  // Fetch the download links from the provided URL
  const videoLinks = await pler(url);
  
  // Check if there are any available download links
  if (!videoLinks || videoLinks.length === 0) {
    await m.reply('No download links found. ex ;\n\n *.twitter* https://x.com/Indomielovers/status/1917826490068279736');
    return;
  }

  // Select a random link from the available download links
  const randomLink = videoLinks[Math.floor(Math.random() * videoLinks.length)];

  // Send the video directly with the random quality chosen
  await conn.sendMessage(m.chat, { video: { url: randomLink.downloadUrl }, caption: `Video downloaded in quality: ${randomLink.quality}` }, { quoted: m });
}

handler.help = handler.command = ['twitter']
handler.tags = ['downloader']
handler.limit = true;
export default handler;
