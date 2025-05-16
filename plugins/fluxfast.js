//plugin by noureddineouafy 
//scrape by Seaavey (THANKS bro)
import axios from "axios"
let handler = async (m, { conn }) => {
  try {
    // Extract prompt from message text, assuming the command is followed by the prompt
    const prompt = m.text.split(" ").slice(1).join(" ").trim()
    
    if (!prompt) {
      return conn.reply(m.chat, "Please provide a prompt. Usage: /fluxfast <prompt>", m)
    }

    const { data } = await axios.post(
      "https://fluxai.pro/api/tools/fast",
      {
        prompt
      },
      {
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "Mozilla/5.0 (compatible; FluxAI-Client/1.0)",
          Accept: "application/json"
        }
      }
    )

    // Check if the response contains an image URL in the nested data object
    if (!data || !data.data || !data.data.imageUrl) {
      return conn.reply(m.chat, `No image URL found in the response. Response: ${JSON.stringify(data, null, 2)}`, m)
    }

    // Send the image directly using conn.sendFile
    await conn.sendFile(m.chat, data.data.imageUrl, "image.jpg", "Here is your generated image!", m)
  } catch (error) {
    console.error("Error in aiFluxFast:", error)
    await conn.reply(m.chat, "An error occurred while processing the request.", m)
  }
}

handler.help = ["fluxfast"]
handler.command = ["fluxfast"]
handler.tags = ["ai"]
handler.limit = true;
export default handler
