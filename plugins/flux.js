import axios from "axios";

let handler = async (m, { conn, text }) => {
  try {
    if (!text) throw 'Please provide a prompt for the image';
    
    m.reply('Generating image, please wait...');
    
    const session_hash = Math.random().toString(36).slice(2);
    const base = "https://rooc-flux-fast.hf.space";
    
    const endpoints = {
      join: `${base}/gradio_api/queue/join`,
      dataStream: `${base}/gradio_api/queue/data?session_hash=${session_hash}`
    };
    
    let payload = {
      data: [text],
      event_data: null,
      fn_index: 0,
      session_hash,
      trigger_id: 10
    };
    
    let { data } = await axios.post(endpoints.join, payload);
    let event_id = data.event_id;
    let result = null;
    
    const responseStream = await axios.get(endpoints.dataStream, {
      responseType: "stream"
    });
    
    for await (const chunk of responseStream.data) {
      let lines = chunk
        .toString()
        .split("\n")
        .filter(line => line.startsWith("data: "));
        
      for (let line of lines) {
        let parsed = JSON.parse(line.replace("data: ", ""));
        if (parsed.msg === "process_completed" && parsed.event_id === event_id) {
          result = parsed.output.data[0].url;
          break;
        }
      }
      if (result) break;
    }
    
    if (result) {
      // Send as image (not sticker) with caption
      await conn.sendMessage(m.chat, { 
        image: { url: result },
        caption: `Generated image for: "${text}"`,
        mentions: [m.sender]
      }, { quoted: m });
    } else {
      throw 'Failed to generate image';
    }
  } catch (error) {
    m.reply(`Error: ${error.message || error}`);
    console.error(error);
  }
}

handler.help = ['flux'];
handler.command = ['flux'];
handler.tags = ['ai'];
handler.limit = true
export default handler
