let handler = async (m, { text }) => {
  if (!text) return m.reply("Example: .tosunda silana");

  const latinToSundanese = {
    'a': 'ᮅ', 'b': 'ᮘ', 'c': 'ᮎ', 'd': 'ᮓ', 'e': 'ᮌ',
    'f': 'ᮕ', 'g': 'ᮎ', 'h': 'ᮠ', 'i': 'ᮄ', 'j': 'ᮏ',
    'k': 'ᮊ', 'l': 'ᮜ', 'm': 'ᮙ', 'n': 'ᮔ', 'o': 'ᮇ',
    'p': 'ᮕ', 'q': 'ᮃ', 'r': 'ᮛ', 's': 'ᮞ', 't': 'ᮒ',
    'u': 'ᮅ', 'v': 'ᮗ', 'w': 'ᮝ', 'x': 'ᮞ', 'y': 'ᮌ',
    'z': 'ᮚ', ' ': ' '
  };

  const convertToSundanese = (text) =>
    [...text.toLowerCase()].map(char => latinToSundanese[char] || char).join('');

  const result = convertToSundanese(text);
  await m.reply(result);
};

handler.help = handler.command = ['tosunda'];
handler.tags = ['tools'];
export default handler;
