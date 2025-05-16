import axios from "axios";
import FormData from "form-data";

let handler = async (m, { conn }) => {
    if (!m.quoted || !m.quoted.mimetype || !/video/.test(m.quoted.mimetype)) {
        return conn.reply(m.chat, "⚠️ Please reply to a video to upload.", m);
    }

    conn.reply(m.chat, "🔄 Uploading video to Videy...", m);

    try {
        const videoBuffer = await m.quoted.download(); // Download the video buffer from the message
        const fileName = "uploaded_video.mp4"; // Default file name for the video
        const uploadResult = await uploadVidey(videoBuffer, fileName);

        conn.reply(m.chat, `✅ Video uploaded successfully!\n\n🔗 *Upload Link:* ${uploadResult.uploaded}`, m);
    } catch (error) {
        console.error("Error in Videy upload:", error.message);
        conn.reply(m.chat, `❌ An error occurred while uploading the video: ${error.message}`, m);
    }
};

handler.help = ["upload-videy"];
handler.tags = ["uploader"];
handler.command = /^upload-videy$/i;
handler.limit = true;
export default handler;

async function uploadVidey(fileBuffer, fileName) {
    let form = new FormData();
    form.append("file", fileBuffer, fileName);

    try {
        const { data } = await axios.post("https://videy.co/api/upload?visitorId=", form, {
            headers: {
                ...form.getHeaders(),
            },
        });

        return {
            uploaded: "https://videy.co/v?id=" + data.id
        };
    } catch (error) {
        throw new Error(`Failed to upload video: ${error.message}`);
    }
}
