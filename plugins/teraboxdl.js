import axios from 'axios';

const teraboxdl = async (url) => {
  try {
    const token = await axios.get('https://teraboxdl.site/api/token');
    const res = await axios.get('https://teraboxdl.site/api/terabox?url=' + url, {
      headers: { 'x-access-token': token.data.token },
    });
    if (res.data && res.data.status === 'success') {
      return res.data.data;
    }
    throw new Error('الخدمة لم تُرجع حالة نجاح');
  } catch (err) {
    throw new Error(`خطأ في teraboxdl: ${err.message}`);
  }
};

const downloadFileWithRetry = async (fileUrl, retries = 3, delay = 5000) => {
  let lastError;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const file = await axios.get(fileUrl, {
        responseType: 'arraybuffer',
        timeout: 60000, // 60 ثانية
      });
      return Buffer.from(file.data);
    } catch (err) {
      lastError = err;
      if (attempt < retries) {
        console.log(`محاولة ${attempt} فشلت، سيتم المحاولة مرة أخرى...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw new Error(`فشل في تحميل الملف بعد ${retries} محاولات: ${lastError.message}`);
      }
    }
  }
};

const handler = async (m, { conn, args }) => {
  if (!args[0]) return m.reply('يرجى إدخال رابط تيرابوكس! \n download files from terabox ex : \n *.teraboxdl* https://1024terabox.com/s/1fmYGvy12AdXEruDqP2agCQ');

  const waitMsg = await conn.sendMessage(m.chat, { text: '⏳ المرجو الانتظار، يتم تحميل الملف...' }, { quoted: m });

  try {
    const result = await teraboxdl(args[0]);
    const files = result.all_files || result.structure?.files || [];

    if (!Array.isArray(files) || files.length === 0) {
      throw new Error('لم يتم العثور على ملفات داخل الرابط.');
    }

    const fileInfo = files[0];
    const fileUrl = fileInfo.dlink || fileInfo.download_url || fileInfo.direct_link || fileInfo.stream_url;

    if (!fileUrl) {
      throw new Error('لم يتم العثور على رابط تحميل مباشر داخل الملف.');
    }

    const head = await axios.head(fileUrl);
    const fileSize = parseInt(head.headers['content-length'], 10);
    const fileSizeMB = fileSize / (1024 * 1024);

    if (isNaN(fileSizeMB)) throw new Error('تعذر تحديد حجم الملف.');
    if (fileSizeMB > 100) throw new Error(`الملف كبير جدًا (${fileSizeMB.toFixed(2)} MB). الحد الأقصى هو 100MB.`);

    // تحميل الملف مع محاولات متعددة
    const buffer = await downloadFileWithRetry(fileUrl);

    const fileName = fileInfo.file_name || 'file';
    await conn.sendFile(m.chat, buffer, fileName, '', m);
  } catch (err) {
    await conn.reply(m.chat, `حدث خطأ:\n${err.message}`, m);
  } finally {
    // نحذف رسالة الانتظار
    if (waitMsg?.key) await conn.sendMessage(m.chat, { delete: waitMsg.key });
  }
};

handler.help = ['teraboxdl'];
handler.command = ['teraboxdl'];
handler.tags = ['downloader'];
handler.limit = true 
export default handler;
