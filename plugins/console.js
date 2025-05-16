let consoleLogs = "";

// Function to capture console logs
function captureConsoleLogs() {
  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;

  console.log = function(...args) {
    const message = args.join(' ');
    consoleLogs += `[LOG] ${message}\n`;
    originalConsoleLog.apply(console, args);
  };

  console.error = function(...args) {
    const message = args.join(' ');
    consoleLogs += `[ERROR] ${message}\n`;
    originalConsoleError.apply(console, args);
  };
}

// Function to send console logs
async function sendConsoleLogs(conn, chatId) {
  if (!consoleLogs) {
    return conn.sendMessage(chatId, { text: 'No logs available.' });
  }
  await conn.sendMessage(chatId, { text: consoleLogs });

  // If you want to send the logs as a text file
  // const tempFilePath = '/tmp/console_logs.txt';
  // fs.writeFileSync(tempFilePath, consoleLogs);
  // await conn.sendMessage(chatId, { document: { url: tempFilePath }, mimetype: 'text/plain', fileName: 'console_logs.txt' });
  
  consoleLogs = ''; // Clear logs after sending
}

let handler = async (m, { conn }) => {
  try {
    await sendConsoleLogs(conn, m.chat);
  } catch (error) {
    console.error('An error occurred:', error);
    await conn.sendMessage(m.chat, { text: `⚠️ Error: ${error.message}` }, { quoted: m });
  }
};

// Start capturing console logs
captureConsoleLogs();

handler.help = ['console'];
handler.tags = ['owner'];
handler.command = /^console$/i;
handler.owner = true;
export default handler;
