import { createCanvas, loadImage } from 'canvas';

let handler = async (m, { conn, text }) => {
    // Example usage: !test avatar1URL avatar2URL backgroundURL
    const [avatar1URL, avatar2URL, backgroundURL] = text.split(' ');

    if (!avatar1URL || !avatar2URL || !backgroundURL) {
        return m.reply('Please provide the URLs for both avatars and the background image.\nExample: !test avatar1URL avatar2URL backgroundURL');
    }

    try {
        const buffer = await Loversss({ avatar1URL, avatar2URL, backgroundURL });
        await conn.sendFile(m.chat, buffer, 'matchLove.png', '❤️ Love Message ❤️', m);
    } catch (error) {
        console.error(error);
        m.reply('An error occurred while generating the love message image.');
    }
};

handler.help = handler.command = ['love'];
handler.tags = ['tools'];
export default handler;

async function Loversss({ avatar1URL, avatar2URL, backgroundURL }) {
    const width = 1920;
    const height = 1080;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Load and draw the background image
    const background = await loadImage(backgroundURL);
    ctx.drawImage(background, 0, 0, width, height);

    // Draw a red heart shape
    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.moveTo(width / 2, 300);
    ctx.bezierCurveTo(width / 2 - 180, 200, width / 2 - 180, 450, width / 2, 600);
    ctx.bezierCurveTo(width / 2 + 180, 450, width / 2 + 180, 200, width / 2, 300);
    ctx.fill();

    // Add a love quote
    const quote = "الحب هو عندما تشعر بأنك تريد أن تكون معهم دائمًا.\n" +
"الحب ليس مجرد امتلاك، بل هو أيضًا عن العطاء.\n" +
"الحب هو القوة التي تحرك العالم.\n" +
"في الحب، نجد أنفسنا الحقيقية.\n" +
"الحب هو رحلة، وليس وجهة.\n" +
"الحب يجعلنا شجعان لمواجهة كل العقبات.";

    ctx.font = 'bold 48px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';

    const lines = quote.split('\n');
    const lineHeight = 50;
    const startY = 770;

    lines.forEach((line, index) => {
        ctx.fillText(line, width / 2, startY + index * lineHeight);
    });

    ctx.textAlign = 'left';

    // Load and draw the first avatar
    const avatar1 = await loadImage(avatar1URL);
    const avatar1X = 100;
    const avatar1Y = 200;
    const avatar1Size = 400;

    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(
        avatar1X + avatar1Size / 2,
        avatar1Y + avatar1Size / 2,
        avatar1Size / 2 + 5,
        0,
        Math.PI * 2
    );
    ctx.stroke();

    ctx.save();
    ctx.beginPath();
    ctx.arc(
        avatar1X + avatar1Size / 2,
        avatar1Y + avatar1Size / 2,
        avatar1Size / 2,
        0,
        Math.PI * 2
    );
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar1, avatar1X, avatar1Y, avatar1Size, avatar1Size);
    ctx.restore();

    ctx.font = 'bold 48px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('أنا', avatar1X + 50, avatar1Y + avatar1Size + 50);

    // Load and draw the second avatar
    const avatar2 = await loadImage(avatar2URL);
    const avatar2X = width - avatar1X - avatar1Size;
    const avatar2Y = avatar1Y;

    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(
        avatar2X + avatar1Size / 2,
        avatar2Y + avatar1Size / 2,
        avatar1Size / 2 + 5,
        0,
        Math.PI * 2
    );
    ctx.stroke();

    ctx.save();
    ctx.beginPath();
    ctx.arc(
        avatar2X + avatar1Size / 2,
        avatar2Y + avatar1Size / 2,
        avatar1Size / 2,
        0,
        Math.PI * 2
    );
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar2, avatar2X, avatar2Y, avatar1Size, avatar1Size);
    ctx.restore();

    ctx.font = 'bold 48px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('أنت', avatar2X + 50, avatar2Y + avatar1Size + 50);

    // Add a title
    ctx.font = 'bold 64px Arial';
    ctx.fillStyle = '#ff0000';
    ctx.fillText('الحب مع سيلانا', width / 2 - 250, 100);

    // Add a watermark
    ctx.fillStyle = '#ff4500';
    ctx.fillRect(20, 20, 150, 50);
    ctx.font = 'bold 28px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('LilyCupid', 40, 55);

    // Return the image buffer
    return canvas.toBuffer('image/png');
      }
