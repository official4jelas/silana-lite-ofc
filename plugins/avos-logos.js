let handler = async (m, { conn, text }) => {
  let validEffects = [
    "sweetheart", "flutter", "pinkglow", "volcano", "petalprint", "giftwrap", "mrfrosty", "littlehelper",
    "sprinklesparkle", "seasonsgreetings", "heartbeat", "valentine", "sapphireheart", "signature", "lollipop",
    "handbag", "tiptoe", "sketchy", "ghostship", "oldenglish", "dragonscale", "magicdust", "substance",
    "piratescove", "backstreet", "funkyzeit", "airman", "foolsgold", "zephyr", "paintbrush", "lokum", "insignia",
    "cottoncandy", "fairygarden", "neonlights", "glowstick", "lavender", "ohhai", "bluegecko", "moderno",
    "petalprint", "rhizome", "devana", "cupcake", "fame", "ionize", "volcano", "broadway", "sweetheart",
    "starshine", "flowerpower", "gobstopper", "discodiva", "medieval", "fruityfresh", "letterboard",
    "greenstone", "alieninvasion", "pinkglow", "pinkcandy", "losttales", "glowtxt", "purple", "yourstruly",
    "electricblue", "greek", "cyrillic", "cyrillic2", "cyrillic3", "korean", "arabic", "arabic2", "arabic3",
    "hindi", "chinese", "japanese", "hebrew", "hebrew2", "hebrew3", "ethiopic", "ethiopic2", "ethiopic3",
    "vietnamese", "icelandic", "bengali", "yoruba", "igbo", "armenian", "armenian2", "georgian", "georgian2",
    "thai", "euro", "euro2", "euro3", "allstars", "dearest", "metropol", "ransom", "bronco", "platformtwo",
    "fictional", "typeface", "stardate", "beachfront", "arthouse", "sterling", "jukebox", "bubbles",
    "invitation", "frontier", "surprise", "firstedition", "republika", "jumble", "warehouse", "orientexpress",
    "orbitron", "starlight", "jet", "tamil", "kannada", "telugu", "punjabi", "malayalam", "odia", "thai2",
    "thai3", "thai4", "hindi2", "hindi3", "hindi4", "hindi5", "hindi6", "hindi7", "hindi8", "euro4",
    "arabic4", "arabic5", "arabic6", "hebrew4", "hebrew5", "hebrew6", "cyrillic4", "japanese2", "japanese3",
    "japanese4", "japanese5", "japanese6", "japanese7", "japanese8", "japanese9", "japanese10", "japanese11",
    "japanese12", "japanese13", "chinese_tc"
  ];

  if (!text.includes(',')) return m.reply(
    `*❌ تنسيق غير صحيح!*\n` +
    `استخدم: *.avos-logos النص,التأثير*\n` +
    `مثال: *.avos-logos Hello,sweetheart*\n\n` +
    `*✅ التأثيرات المتاحة:*\n${validEffects.map((v, i) => `${i + 1}. ${v}`).join('\n')}`
  );

  let [inputText, effect] = text.split(',');
  inputText = inputText.trim();
  effect = effect.trim().toLowerCase();

  if (!inputText || !effect) return m.reply(
    `*⚠️ تنسيق غير صحيح! تأكد من عدم ترك النص أو التأثير فارغًا.*\n\n` +
    `*✅ التأثيرات المتاحة:*\n${validEffects.map((v, i) => `${i + 1}. ${v}`).join('\n')}`
  );

  if (!validEffects.includes(effect)) {
    return m.reply(
      `*❌ تأثير غير صالح!*\n` +
      `*✅ استخدم أحد التأثيرات التالية:*\n${validEffects.map((v, i) => `${i + 1}. ${v}`).join('\n')}`
    );
  }

  let apiUrl = `https://api.crafters.biz.id/maker/avos?text=${encodeURIComponent(inputText)}&effect=${encodeURIComponent(effect)}`;
  await conn.sendMessage(m.chat, { text: '⏳ جارٍ المعالجة...' });

  try {
    let res = await fetch(apiUrl);
    let json = await res.json();

    if (json.status && json.result?.url) {
      await conn.sendMessage(m.chat, {
        image: { url: json.result.url },
        caption: `✅ *تم بنجاح!*\n🖌️ التأثير: *${effect}*`
      }, { quoted: m });
    } else {
      m.reply('❌ فشل في إنشاء النص مع التأثير. حاول مرة أخرى لاحقًا!');
    }
  } catch (e) {
    console.error(e);
    m.reply('⚠️ حدث خطأ أثناء جلب البيانات.');
  }
};

handler.help = ['avos-logos'];
handler.tags = ['tools'];
handler.command = /^avos-logos$/i;
handler.limit = true 
export default handler;
