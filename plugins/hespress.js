import cheerio from 'cheerio';
import fetch from 'node-fetch';
import baileys from '@adiwajshing/baileys';

const { proto, generateWAMessageFromContent } = baileys;

async function response(jid, data, quoted) {
    let msg = generateWAMessageFromContent(jid, {
        viewOnceMessage: {
            message: {
                interactiveMessage: proto.Message.InteractiveMessage.create({
                    body: proto.Message.InteractiveMessage.Body.create({ text: data.body }),
                    footer: proto.Message.InteractiveMessage.Footer.create({ text: data.footer }),
                    header: proto.Message.InteractiveMessage.Header.create({ title: data.title }),
                    nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                        buttons: [{
                            name: 'single_select',
                            buttonParamsJson: JSON.stringify({ title: '📌 اضغط لقراءة خبر', sections: data.sections })
                        }]
                    })
                })
            }
        }
    }, { quoted });

    await conn.relayMessage(jid, msg.message, { messageId: msg.key.id });
}

let handler = async (m, { conn, text, command }) => {
    if (command === "hespress") {
        await m.reply("🔍 جاري جلب الأخبار...");
        try {
            let news = await allHespress();
            if (!news.length) return m.reply("❌ لم يتم العثور على أخبار.");

            let sections = [{
                title: '📰 آخر الأخبار من هسبريس',
                rows: news.map(item => ({
                    title: item.title,
                    description: `📅 ${item.date}`,
                    id: `.hespressread ${item.link}`
                }))
            }];

            let message = {
                title: "📢 قائمة الأخبار",
                body: "🔽 اختر خبرًا لقراءته",
                footer: "المصدر: Hespress",
                sections
            };

            await response(m.chat, message, m);
        } catch (e) {
            await m.reply("❌ حدث خطأ أثناء جلب الأخبار.");
        }
    } 
    else if (command === "hespressread") {
        if (!text) return m.reply("مثال:\n.hespressread https://www.hespress.com/وسطاء-التأمين-يطالبون-بتحويل-فاجعة-زل-1234182.html");

        await m.reply("⏳ جارٍ جلب التفاصيل...");
        try {
            let url = text.trim();
            let item = await readHespress(url);

            let cap = `تابع صاحب البوت في حسابه:\ninstagram.com/noureddine_ouafy\n
            
Title: ${item.title}
Image: ${item.image}
Caption: ${item.caption}
Author: ${item.author}
Date: ${item.date}
Content: ${item.content}
Tags: ${item.tags}
`;

            await conn.sendFile(m.chat, item.image || logo, "", cap, m);
        } catch (e) {
            await m.reply("*❌ وقع خطأ، لم أستطع تلبية طلبكم.*");
        }
    }
};

handler.help = ["hespress"];
handler.tags = ["morocco"];
handler.command = /^(hespress|hespressread)$/i;
handler.limit = true 
export default handler;

// التحقق مما إذا كان الإدخال رقمًا
function isNumberFormat(input) {
    return /^\d+$/.test(input);
}

async function allHespress() {
    try {
        const response = await fetch('https://www.hespress.com/all');
        const html = await response.text();

        const $ = cheerio.load(html);
        const result = [];

        $('.col-12.col-sm-6.col-md-6.col-xl-3').each((index, element) => {
            const card = {
                title: $(element).find('.card-title').text().trim(),
                date: $(element).find('.date-card small').text().trim(),
                image: $(element).find('.card-img-top img').attr('src'),
                link: $(element).find('.stretched-link').attr('href')
            };

            result.push(card);
        });

        return result;
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
}

async function readHespress(url) {
    try {
        const response = await fetch(url);
        const html = await response.text();

        const $ = cheerio.load(html);
        $('script, style').remove();
        
        const title = $('.post-title').text().trim();
        const image = $('.figure-heading-post .post-thumbnail img').attr('src');
        const caption = $('.figure-heading-post figcaption').text().trim();
        const author = $('.author a').text().trim();
        const date = $('.date-post').text().trim();
        const content = $('.article-content').text().trim();
        const tags = $('.box-tags .tag_post_tag').map((i, el) => $(el).text().trim()).get();

        return { title, image, caption, author, date, content, tags };
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}
