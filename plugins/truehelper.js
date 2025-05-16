//plugin by noureddineouafy 
//scrape by NajmyW's / Daffa 
//thanks to scraper 

let handler = async (m, { conn }) => {
    try {
        const url = 'https://truehelper-noneu.truecaller.com/v0/chat';
        const headers = {
            'Accept-Encoding': 'gzip',
            'Authorization': 'Bearer a2i0o--tv6xvqkV-FOrxcmEfLArf-EsynBjcGv1YmPAhN0mUF6z-y4Lpx7hq1JRb',
            'Connection': 'Keep-Alive',
            'Content-Type': 'application/json; charset=UTF-8',
            'Host': 'truehelper-noneu.truecaller.com',
            'User-Agent': 'Truecaller/15.38.5 (Android;12)'
        };

        const body = {
            "messages": [
                {
                    "content": "Hey there! You can ask me anything and I will do my best to give you the answer that is best to my knowledge.\n\nCapabilities: \n\nRemembers what user said earlier in the conversation\nAllows user to provide follow-up corrections\nTrained to decline inappropriate requests\n\nLimitations\n\nMay occasionally generate incorrect information\nMay occasionally produce harmful instructions or biased content\nLimited knowledge of world and events after 2021\n\nNote: You have a maximum 15 questions per day, so use them wisely. This feature is powered by OpenAI’s ChatGPT 3.5.",
                    "role": "system"
                },
                {
                    "content": m.text,
                    "role": "user"
                }
            ]
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(body)
        });

        const result = await response.json();

        // استخراج محتوى الجواب من المساعد
        const assistantMessage = result?.message?.content || 'لم يتم العثور على رد.';

        await conn.reply(m.chat, assistantMessage, m);

    } catch (error) {
        await conn.reply(m.chat, error.message, m);
    }
};

handler.help = ['truehelper'];
handler.command = ['truehelper'];
handler.tags = ['ai'];
handler.limit = true;
export default handler;
