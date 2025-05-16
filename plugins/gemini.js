import axios from "axios";
import FormData from "form-data";

const gemini = {
   chat: async (question) => {
      let d = new FormData();
      d.append("content", `User: ${question}`);
      d.append("model", "@google/gemini-2.0-flash-exp");
      
      let head = {
         headers: {
            ...d.getHeaders()
         }
      };
      
      let { data: ak } = await axios.post("https://mind.hydrooo.web.id/v1/chat", d, head);
      
      return ak.result;
   }
};

let handler = async (m, {conn, text}) => {
   if (!text) return m.reply('Please provide a question for the chatbot.');
   
   try {
      const response = await gemini.chat(text);
      await m.reply(response);
   } catch (error) {
      console.error('Error fetching response from Gemini:', error);
      await m.reply('Failed to get a response from the chatbot.');
   }
}

handler.help = ['gemini']
handler.command = ['gemini']
handler.tags = ['ai']
handler.limit = true
export default handler;
