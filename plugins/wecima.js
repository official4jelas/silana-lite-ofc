import axios from 'axios';
import cheerio from 'cheerio';

let handler = async (m, { conn }) => {
    const totalPages = 4295;
    const randomPage = Math.floor(Math.random() * totalPages) + 1;
    const url = `https://wecima.movie/page/${randomPage}/`;

    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        const movies = [];

        $('.Grid--WecimaPosts .GridItem').each((index, element) => {
            const title = $(element).find('a').attr('title');
            const link = $(element).find('a').attr('href');
            const year = $(element).find('.year').text().trim();

            movies.push({ title, link, year });
        });

        if (movies.length > 0) {
            let message = `*WECIMA MOVIES - Page ${randomPage}*\n\n`;
            for (const movie of movies) {
                message += `• *${movie.title}* (${movie.year})\n🔗 ${movie.link}\n\n`;
            }
            conn.sendMessage(m.chat, { text: message });
        } else {
            conn.sendMessage(m.chat, { text: 'No movies found on this page.' });
        }
    } catch (error) {
        console.error('Error fetching movies:', error);
        conn.sendMessage(m.chat, { text: 'An error occurred while fetching movie data.' });
    }
}

handler.help = handler.command = ['wecima'];
handler.tags = ['search'];

export default handler;
