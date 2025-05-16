import axios from 'axios';
import cheerio from 'cheerio';

let handler = async (m, { conn, text }) => {
    if (!text) return m.reply('Please provide an APK URL.');

    try {
        const appUrl = text.trim();
        const results = await apkdogDownload(appUrl);

        if (results.length > 0) {
            m.reply(JSON.stringify(results, null, 2));
        } else {
            m.reply('No download links found.');
        }
    } catch (error) {
        console.log(error);
        m.reply('Error: ' + error.message);
    }
};

handler.help = handler.command = ['apkdog'];
handler.tags = ['downloader'];
export default handler;

async function apkdogDownload(appUrl) {
    try {
        const { data } = await axios.get(appUrl);
        const $ = cheerio.load(data);
        const results = [];

        const downloadLinks = $('.dwn_btn_wrap a.dwn1');

        for (let index = 0; index < downloadLinks.length; index++) {
            const element = downloadLinks[index];
            const downloadUrl = $(element).attr('href');
            const appSize = $(element).find('span').text().trim().replace('Downloadfree', '');

            try {
                const downloadPage = await axios.get(downloadUrl);
                const $$ = cheerio.load(downloadPage.data);
                const downloadApp = $$('div.dwn_up.top1 .dwn_btn_wrap a.dwn1').attr('href');

                results.push({
                    appSize,
                    downloadUrl,
                    downloadApp
                });
            } catch (errorFetch) {
                console.log(errorFetch);
                throw new Error('Error fetching downloadUrl: ' + errorFetch.message);
            }
        }

        return results;
    } catch (error) {
        console.log(error);
        throw new Error('Error: ' + error.message);
    }
}
