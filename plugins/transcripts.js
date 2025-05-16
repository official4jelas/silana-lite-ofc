import axios from "axios";
const apiInstance = axios.create({
    baseURL: "https://api.kome.ai",
    headers: {
      "Content-Type": "application/json",
      Referer: "https://api.kome.ai"
    }
  }),
  youtubeTranscript = async videoId => {
    try {
      const response = await apiInstance.post("/api/tools/youtube-transcripts", {
        video_id: videoId,
        format: !0
      });
      if (void 0 === response.data.transcript) throw new Error("Transcript not found");
      return response.data.transcript;
    } catch (error) {
      console.error("Error in youtubeTranscript:", error);
    }
  }, handler = async (m, {
    conn,
    args
  }) => {
    const text = args.length >= 1 ? args.slice(0).join(" ") : m.quoted && m.quoted?.text || m.quoted?.caption || m.quoted?.description || null;
    if (!text) return m.reply(`هذا الامر خاص ب الحصول على ال caption الخاص باي فيديو على اليوتوب مثال :\n*.transcripts* https://www.youtube.com/watch?v=hv-ldQ98DN4`);
    const matches = text.trim().match(/^https?:\/\/(www\.)?youtube\.com\/watch\?v=[a-zA-Z0-9_-]{11}$/);
    if (!matches || !matches[0]) return m.reply("Invalid YouTube URL");
    try {
      const transcribe = await youtubeTranscript(matches[0]);
      m.reply(transcribe);
    } catch (error) {
      console.error("Error in handler:", error);
    }
  };
handler.help = ["transcripts"], handler.tags = ["ai"], handler.command = /^(transcripts)$/i;
export default handler;
