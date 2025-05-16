// scrape by JazxCode
//plugin by noureddine ouafy
import axios from 'axios';
import cheerio from 'cheerio';

// The main handler function
let handler = async (m, { conn, args, text }) => {
  // Check if a username was provided
  if (!args[0]) {
    throw 'Please provide an Instagram username! Example: !igstalk noureddine_ouafy';
  }

  // The Instagram stalking function
  async function igstalkv2(query) {
    const endpoint = 'https://privatephotoviewer.com/wp-json/instagram-viewer/v1/fetch-profile';
    const payload = { find: query };
    const headers = {
      'Content-Type': 'application/json',
      'Accept': '*/*',
      'X-Requested-With': 'XMLHttpRequest',
      'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Mobile Safari/537.36',
      'Referer': 'https://privatephotoviewer.com/'
    };

    try {
      const { data } = await axios.post(endpoint, payload, { headers });
      const html = data.html;
      const $ = cheerio.load(html);
      let profilePic = $('#profile-insta').find('.col-md-4 img').attr('src');
      if (profilePic && profilePic.startsWith('//')) {
        profilePic = 'https:' + profilePic;
      }
      const name = $('#profile-insta').find('.col-md-8 h4.text-muted').text().trim();
      const username = $('#profile-insta').find('.col-md-8 h5.text-muted').text().trim();
      const stats = {};
      $('#profile-insta')
        .find('.col-md-8 .d-flex.justify-content-between.my-3 > div')
        .each((i, el) => {
          const statValue = $(el).find('strong').text().trim();
          const statLabel = $(el).find('span.text-muted').text().trim().toLowerCase();
          if (statLabel.includes('posts')) {
            stats.posts = statValue;
          } else if (statLabel.includes('followers')) {
            stats.followers = statValue;
          } else if (statLabel.includes('following')) {
            stats.following = statValue;
          }
        });
      const bio = $('#profile-insta').find('.col-md-8 p').text().trim();
      return {
        name,
        username,
        profilePic,
        posts: stats.posts,
        followers: stats.followers,
        following: stats.following,
        bio
      };
    } catch (error) {
      console.error('Error fetching Instagram profile:', error.message);
      throw new Error('Failed to fetch Instagram profile. Please try again later.');
    }
  }

  try {
    // Call the igstalkv2 function with the provided username
    const result = await igstalkv2(args[0]);
    
    // Format the response (excluding the profile picture URL since we'll send it as an image)
    const response = `
*Instagram Profile: ${result.username}*
*Name:* ${result.name || 'N/A'}
*Posts:* ${result.posts || '0'}
*Followers:* ${result.followers || '0'}
*Following:* ${result.following || '0'}
*Bio:* ${result.bio || 'No bio available'}`.trim();

    // Check if a profile picture URL exists
    if (result.profilePic) {
      // Send the image with the response as the caption
      await conn.sendMessage(m.chat, {
        image: { url: result.profilePic },
        caption: response
      }, { quoted: m });
    } else {
      // If no profile picture, just send the text response
      await conn.reply(m.chat, response, m);
    }
  } catch (error) {
    // Handle errors and notify the user
    await conn.reply(m.chat, error.message, m);
  }
};

// Define command metadata
handler.help = ['igstalk'];
handler.command = ['igstalk'];
handler.tags = ['search'];
handler.limit = true 
export default handler;
