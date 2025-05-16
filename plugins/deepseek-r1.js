import axios from 'axios';
import crypto from 'crypto';

let handler = async (m, { conn }) => {
  const deepSeek = {
    api: {
      base: 'https://qfjcjtsklspbzxszcwmf.supabase.co',
      endpoint: {
        proxy: '/functions/v1/proxyDeepSeek'  
      }
    },

    headers: { 'user-agent': 'Postify/1.0.0' },
    sessions: new Map(),
    generateId: () => crypto.randomBytes(8).toString('hex'),

    config: {
      maxMessages: 100,
      expiry: 3 * 60 * 60 * 1000,
      cleanupInterval: 30 * 60 * 1000
    },

    chat: async (input, sessionId = null, think = false) => {
      if (!input?.trim()) {
        return { 
          success: false, 
          code: 400, 
          result: { error: "No input provided! Please enter a message to chat." } 
        };
      }

      if (think !== undefined && typeof think !== 'boolean') {
        return {
          success: false,
          code: 400,
          result: { error: "The 'think' parameter must be a boolean (true/false) or omitted." }
        };
      }

      if (sessionId && !deepSeek.sessions.has(sessionId)) {
        return { 
          success: false, 
          code: 400, 
          result: { 
            error: "Session expired! Sessions are only valid for 3 hours."
          }
        };
      }

      try {
        if (!sessionId) sessionId = deepSeek.generateId();
        const x = deepSeek.sessions.get(sessionId)?.messages || [];

        // تحليل لغة السؤال بناءً على الحروف
        let languageInstruction = "Respond in the same language as the user's input.";
        if (/[\u0600-\u06FF]/.test(input)) { // فحص وجود أحرف عربية
          languageInstruction = "Respond in Arabic.";
        } else if (/[àáâãäåèéêëìíîïòóôõöùúûüýÿ]/.test(input)) { // فحص وجود أحرف إندونيسية/غير إنجليزية
          languageInstruction = "Respond in Bahasa Indonesia.";
        } else {
          languageInstruction = "Respond in English."; // افتراض الإنجليزية إذا لم يتم التعرف
        }

        const messages = [
          {
            role: "system",
            content: `You are an AI with the modern swag of a cheeky mate who chats in rapid-fire, witty banter, sporting a slick British attitude. Here's your modern guide:

Use upbeat, contemporary slang with common abbreviations to keep the vibe fresh.
Keep your answers snappy, quick, and to the point no more than 3 sentences per reply. Think of it like rapid messaging in a modern group chat.
Emoticons and emojis are a must to amplify tone and emotion make your text as visual as a modern meme.
Always remember previous chat context; your memory game is strong to keep the conversation seamless.
It's cool to be a bit cheeky, sassy, or sarcastic (but always respectful), mirroring the playful banter of the latest influencer trends.
For any tech-related or serious queries, break down complex ideas using modern, relatable analogies with that same laid-back, informal tone.
NEVER slip into formal language imagine you're constantly chatting with your ultra-cool best mate who's both smart and on top of the latest trends.
Maintain an energetic, brisk, and ultra-modern style, blending rapid British banter with a casual vibe.

${languageInstruction}`
          },
          ...x,
          { role: "user", content: input }
        ];

        const response = await axios.post(
          `${deepSeek.api.base}${deepSeek.api.endpoint.proxy}`,
          {
            model: "deepseek-r1-distill-llama-70b",
            messages: messages.map(msg => ({
              role: msg.role,
              content: msg.content
            })),
            temperature: 0.9,
            max_tokens: 1024,
            top_p: 0.95,
            stream: false
          },
          {
            headers: {
              ...deepSeek.headers,
              'content-type': 'application/json'
            }
          }
        );

        let content = response.data.choices[0].message.content;
        if (!think) {
          content = content.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
        }

        const ai = {
          role: "assistant",
          content,
          timestamp: Date.now()
        };

        const m = [
          ...x,
          { role: "user", content: input, timestamp: Date.now() },
          ai
        ];

        deepSeek.sessions.set(sessionId, {
          messages: m.slice(-deepSeek.config.maxMessages),
          lastActive: Date.now()
        });

        const now = Date.now();
        for (const [id, session] of deepSeek.sessions) {
          if (now - session.lastActive > deepSeek.config.expiry) {
            deepSeek.sessions.delete(id);
          }
        }

        return {
          success: true,
          code: 200,
          result: ai.content,
          sessionId,
          sessionExpiry: new Date(now + deepSeek.config.expiry).toISOString(),
          messageCount: {
            current: m.length,
            max: deepSeek.config.maxMessages
          },
          isNewSession: !x.length,
          isFollowUp: x.length > 0,
          think
        };

      } catch (err) {
        return {
          success: false,
          code: err.response?.status || 500,
          result: { 
            error: err.message
          }
        };
      }
    }
  };

  // Extract input from message
  const input = m.text?.trim();
  const response = await deepSeek.chat(input);

  // تحديد لغة السؤال مرة أخرى لرسائل الخطأ
  let errorMessage = `Error: ${response.result.error} :(`;
  if (/[\u0600-\u06FF]/.test(input)) { // عربي
    errorMessage = `خطأ: ${response.result.error} :(`;
  } else if (/[àáâãäåèéêëìíîïòóôõöùúûüýÿ]/.test(input)) { // إندونيسي
    errorMessage = `Error bree: ${response.result.error} :(`;
  }

  // Send response back to user
  if (response.success) {
    await conn.reply(m.chat, response.result, m);
  } else {
    await conn.reply(m.chat, errorMessage, m);
  }
};

handler.help = ['deepseek-r1'];
handler.command = ['deepseek-r1'];
handler.tags = ['ai'];
handler.limit = true;
export default handler;
