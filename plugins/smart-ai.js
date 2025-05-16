import fetch from 'node-fetch'

var handler = async (m, {
    conn,
    args,
    usedPrefix,
    command
}) => {
    var text
    if (args.length >= 1) {
        text = args.slice(0).join(" ")
    } else if (m.quoted && m.quoted.text) {
        text = m.quoted.text
    } else return m.reply(`Please enter some text!\n\nExample: *${usedPrefix + command} hello*`)
    
    await m.reply("Please wait a moment, processing your request...")
    
    try {
        var result = await SmartAI(text)
        await m.reply(result.result)
    } catch (e) {
        console.error(e)
        m.reply("An error occurred while processing your request.")
    }
}

handler.command = handler.help = ["smart-ai"]
handler.tags = ["ai"]
handler.limit = true 
export default handler

async function postData(url, payload) {
    try {
        var response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload),
        })
        return await response.json()
    } catch (error) {
        console.error("Error occurred:", error)
    }
}

async function SmartAI(text) {
    try {
        var data = await postData("https://www.toolbot.ai/api/generate", {
            desire: text
        })
        var {
            description,
            prompt
        } = data.result[0]

        var response = await postData("https://www.toolbot.ai/api/query", {
            toolDescription: description,
            query: prompt,
        })
        return response
    } catch (error) {
        console.error("Error occurred:", error)
    }
}
