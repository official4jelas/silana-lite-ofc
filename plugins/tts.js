import axios from 'axios';
import FormData from 'form-data';

let handler = async (m, { conn }) => {
  const openAi = {
    voices: ['Alloy', 'Ash', 'Ballad', 'Coral', 'Echo', 'Fable', 'Onyx', 'Nova', 'Sage', 'Shimmer', 'Verse'],
    vibes: ['Santa', 'True Crime Buff', 'Old-Timey', 'Robot', 'Eternal Optimist'],
    
    default: {
      identity: 'Professional speaker',
      affect: 'Authoritative and friendly, displaying a wise and measured tone',
      tone: 'Professional and formal, easy to understand and acceptable',
      emotion: 'Confident and inspiring, delivering the message clearly',
      pronunciation: 'Clear and firm, with good articulation',
      pause: 'Strategic pauses for emphasis and allowing the audience to digest important points'
    },
    
    api: {
      base: 'https://www.openai.fm/api',
      endpoints: {
        generate: '/generate'
      },
      headers: {
        'origin': 'https://www.openai.fm',
        'referer': 'https://www.openai.fm/'
      }
    },
    
    isValid: (input, prompt) => {
      if (!input?.trim()) {
        return 'Input cannot be empty!';
      }
      
      const isPrompts = ['identity', 'affect', 'tone', 'emotion', 'pronunciation', 'pause'];
      const promptx = isPrompts.filter(param => !prompt?.[param]);
      
      if (promptx.length > 0) {
        return `Prompts ${promptx.join(', ')} must be provided.`;
      }
      
      return null;
    },
    
    generate: async (input, prompt = {}, voice = 'Sage', vibe = '') => {
      const a = openAi.isValid(input, prompt);
      if (a) return {
        status: false,
        code: 400,
        result: {
          error: a
        }
      };
      
      if (!openAi.voices.includes(voice)) return {
        status: false,
        code: 400,
        result: {
          error: `The voice is not valid, choose one from the list: ${openAi.voices.join(', ')}`
        }
      };
      
      if (vibe && !openAi.vibes.includes(vibe)) return {
        status: false,
        code: 400,
        result: {
          error: `The vibe is not valid, choose one from the list: ${openAi.vibes.join(', ')}`
        }
      };
      
      try {
        const formData = new FormData();
        formData.append('input', input);
        formData.append('prompt', Object.entries(prompt)
          .map(([key, value]) => `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`)
          .join('\n\n'));
        formData.append('voice', voice.toLowerCase());
        formData.append('vibe', vibe);
        
        const { data } = await axios.post(
          `${openAi.api.base}${openAi.api.endpoints.generate}`,
          formData,
          {
            headers: {
              ...formData.getHeaders(),
              ...openAi.api.headers
            },
            responseType: 'arraybuffer',
            maxBodyLength: Infinity,
            maxContentLength: Infinity
          }
        );
        
        return {
          status: true,
          code: 200,
          result: {
            audio: data,
            params: {
              input,
              prompt,
              voice,
              vibe
            }
          }
        };
        
      } catch (error) {
        return {
          status: false,
          code: error.response?.status || 500,
          result: {
            error: error.response?.data
              ? Buffer.from(error.response.data).toString()
              : "Error occurred."
          }
        };
      }
    }
  };

  // Checking for the .tts command
  if (m.text && m.text.startsWith('.tts')) {
    const inputText = m.text.slice(5).trim(); // Get all text after .tts
    
    if (!inputText) {
      return conn.sendMessage(m.chat, { text: 'Please enter text to convert to speech. Example: .tts hello how are you' }, { quoted: m });
    }
    
    // Using Sage as the default voice
    const response = await openAi.generate(inputText, openAi.default, 'Sage');
    
    if (response.status) {
      // Sending the generated audio
      conn.sendMessage(m.chat, { audio: response.result.audio, mimetype: 'audio/mp4' }, { quoted: m });
    } else {
      conn.sendMessage(m.chat, { text: response.result.error }, { quoted: m });
    }
  }
};

handler.help = handler.command = ['tts'];
handler.tags = ['ai'];
handler.limit = true
export default handler;
