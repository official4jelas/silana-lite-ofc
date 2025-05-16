import axios from "axios";

async function html2image(html, css = "") {
  try {
    const response = await axios.post(
      "https://htmlcsstoimage.com/demo_run",
      {
        html,
        css,
        console_mode: "",
        url: "",
        selector: "",
        ms_delay: "",
        render_when_ready: "false",
        viewport_height: "",
        viewport_width: "",
        google_fonts: "",
        device_scale: "",
      },
      {
        headers: {
          cookie: "_ga=GA1.2.535741333.1711473772;",
          "x-csrf-token": "pO7JhtS8osD491DfzpbVYXzThWKZjPoXXFBi69aJnlFRHIO9UGP7Gj9Y93xItqiCHzisYobEoWqcFqZqGVJsow",
        },
      }
    );

    return response.data.url ? response.data.url : null;
  } catch (error) {
    return null;
  }
}

let handler = async (m, { conn, text }) => {
    if (!text) return m.reply('⚠️ Please enter the HTML code to convert!');

    // React: Processing 🎨
    await conn.sendMessage(m.chat, {
        react: { text: "🎨", key: m.key }
    });

    let html = text;
    let css = "body { font-family: Arial; }"; // Default CSS

    let imageUrl = await html2image(html, css);
    if (!imageUrl) {
        await conn.sendMessage(m.chat, {
            react: { text: "❌", key: m.key }
        });
        return m.reply('❌ Failed to convert HTML to image!');
    }

    // Send the image as a photo
    await conn.sendMessage(m.chat, {
        image: { url: imageUrl },
        caption: `*🖼️ HTML to Image Result*`
    }, { quoted: m });

    // React: Done ✅
    await conn.sendMessage(m.chat, {
        react: { text: "✅", key: m.key }
    });
};

handler.command = /^(html2image)$/i;
handler.help = ['html2image'];
handler.tags = ['tools'];
handler.limit = true;
export default handler;
