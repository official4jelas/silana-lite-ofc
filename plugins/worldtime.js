import axios from 'axios';
import cheerio from 'cheerio';
import moment from 'moment-timezone';

// Handler function for retrieving world time information
const handler = async (m, { conn }) => {
    try {
        const worldTimes = await fetchWorldTimes();
        let message = "*🌍 World Time Information*\n\n";

        // Sort cities based on their UTC offset
        const sortedTimes = worldTimes.sort((a, b) => {
            const zoneA = moment.tz(a.city, 'UTC').utcOffset();
            const zoneB = moment.tz(b.city, 'UTC').utcOffset();
            return zoneA - zoneB;
        });

        // Format the message
        sortedTimes.forEach(city => {
            message += `${city.flag} *${city.city}*: ${city.time}\n`;
        });

        await m.reply(message);
    } catch (error) {
        console.error("Error retrieving world time:", error);
        await m.reply("Sorry, unable to fetch the current world time information.");
    }
};

// Function to scrape world time data
async function fetchWorldTimes() {
    const url = 'https://onlinealarmkur.com/world/id/';
    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        let results = [];

        $('.flex.items-center.space-x-3').each((index, element) => {
            const flag = $(element).find('.avatar .text-2xl').text().trim();
            const city = $(element).find('.city-name').text().trim();
            const timeZone = $(element).find('.city-time').attr('data-tz');

            if (timeZone) {
                // Convert day abbreviations from English to Indonesian
                const dayMapping = {
                    'Sun': 'Min',
                    'Mon': 'Sen',
                    'Tue': 'Sel',
                    'Wed': 'Rab',
                    'Thu': 'Kam',
                    'Fri': 'Jum',
                    'Sat': 'Sab'
                };

                // Format time using the timezone
                const realTime = moment().tz(timeZone).format('ddd - HH:mm')
                    .replace(/Sun|Mon|Tue|Wed|Thu|Fri|Sat/g, match => dayMapping[match]);

                results.push({ flag, city, time: realTime });
            }
        });

        return results;
    } catch (error) {
        console.error("Error:", error);
        return [];
    }
}

handler.help = ['worldtime'];
handler.command = ['worldtime'];
handler.tags = ['tools'];
handler.limit = true
export default handler;
