/*
File/URL Checker Plugin

This plugin checks files/URLs for potential threats like malware or phishing.

[Source]
https://whatsapp.com/channel/0029Vb3u2awADTOCXVsvia28

[Scrape Source]
https://whatsapp.com/channel/0029Vb5EZCjIiRotHCI1213L/179
*/

import axios from 'axios';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const tmpDir = './tmp';

const nordVPN = {
  api: {
    base: {
      file: "https://file-checker.nordvpn.com/v1/",
      url: "https://link-checker.nordvpn.com/v1/"
    },
    endpoints: {
      filehash: "public-filehash-checker/check",
      check: "public-url-checker/check-url"
    }
  },

  headers: {
    'accept': 'application/json',
    'origin': 'https://nordvpn.com',
    'referer': 'https://nordvpn.com/',
    'user-agent': 'Postify/1.0.0'
  },

  fileStatus: {
    0: "File not found in malware database",
    1: "File is safe",
    2: "WARNING: File contains malware!"
  },

  checkStatus: {
    0: "Done",
    1: "Error occurred. Please try again later.",
    2: "Processing...",
    3: "File not found. Please upload first."
  },

  urlStatus: {
    0: "URL is new, no information available yet",
    1: "URL is safe",
    2: "WARNING: Malware detected!",
    3: "SCAM/PHISHING WARNING!",
    4: "URL detected as spam",
    5: "Suspicious application detected",
    6: "Website looks suspicious",
    7: "Low-quality search engine detected"
  },

  generateFilename: (ext) => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `file_${timestamp}_${random}.${ext}`;
  },

  isValidUrl: (url) => {
    try {
      return /^(https?:\/\/)?([\w.-]+)\.([a-z]{2,})(:\d{1,5})?(\/[^?#]*)(\?([^#]*))?(#.*)?$/i.test(url);
    } catch {
      return false;
    }
  },

  getExtension: (filename) => {
    return filename.split('.').pop().toLowerCase();
  },

  getSHA256: async (content) => {
    try {
      const hash = crypto.createHash('sha256');
      hash.update(content);
      return {
        success: true,
        code: 200,
        result: {
          hash: hash.digest('hex')
        }
      };
    } catch (error) {
      return {
        success: false,
        code: 400,
        result: {
          error: error.message
        }
      };
    }
  },

  getFileInfo: async (file) => {
    try {
      let content, size, ext, fname, contentType;

      if (nordVPN.isValidUrl(file)) {  
        const stats = await axios.head(file);  
        size = parseInt(stats.headers['content-length']);  
        contentType = stats.headers['content-type'];       
        const response = await axios.get(file, {  
          responseType: 'arraybuffer'  
        });  
          
        content = Buffer.from(response.data);  
        const urlParts = file.split('/');  
        fname = urlParts[urlParts.length - 1];  
        ext = nordVPN.getExtension(fname);  

      } else {  
        if (!fs.existsSync(file)) {  
          return {  
            success: false,  
            code: 400,  
            result: {  
              error: "File not found"  
            }  
          };  
        }  

        const stats = fs.statSync(file);  
        content = fs.readFileSync(file);  
        size = stats.size;  
        ext = path.extname(file).substring(1).toLowerCase();  
        fname = path.basename(file);  
        contentType = `image/${ext}`;  
      }  

      return {  
        success: true,  
        code: 200,  
        result: {  
          content,  
          size,  
          ext,  
          fname,  
          contentType  
        }  
      };  

    } catch (error) {  
      return {  
        success: false,  
        code: 400,  
        result: {  
          error: error.message  
        }  
      };  
    }
  },

  checkFile: async (file) => {
    const fileInfo = await nordVPN.getFileInfo(file);
    if (!fileInfo.success) return fileInfo;

    const fileName = nordVPN.generateFilename(fileInfo.result.ext);  
    const sha = await nordVPN.getSHA256(fileInfo.result.content);  
    if (!sha.success) return sha;  

    try {  
      const data = {  
        sha256: sha.result.hash,  
        size: fileInfo.result.size,  
        name: fileName  
      };  

      const res = await axios.post(`${nordVPN.api.base.file}${nordVPN.api.endpoints.filehash}`, data, {  
        headers: {  
          ...nordVPN.headers,  
          'authority': 'file-checker.nordvpn.com'  
        }  
      });  

      const result = res.data;  
      const status = result.status;  
      const category = result.categories?.[0];  
      const isSuccess = status === 0;  
      const isSafe = isSuccess && [0,1].includes(category?.id);  

      return {  
        success: true,  
        code: 200,  
        result: {  
          status: `${nordVPN.checkStatus[status]} (${status})`,  
          category: category ? `${nordVPN.fileStatus[category.id]}` : "",   
          isSafe: isSafe,  
          sha256: sha.result.hash,  
          fileName: fileName,  
          originalName: fileInfo.result.fname,  
          fileSize: fileInfo.result.size,  
          fileType: fileInfo.result.contentType,  
          ext: fileInfo.result.ext,  
          source: nordVPN.isValidUrl(file) ? 'url' : 'local',  
          sourcePath: file  
        }  
      };  

    } catch (error) {  
      return {  
        success: false,  
        code: 400,  
        result: {  
          error: error.message  
        }  
      };  
    }
  },

  checkUrl: async (url) => {
    if (!url) {
      return {
        success: false,
        code: 400,
        result: {
          error: "Please provide a URL to check"
        }
      };
    }

    if (!nordVPN.isValidUrl(url)) {  
      return {  
        success: false,  
        code: 400,  
        result: {  
          error: "Invalid URL format"  
        }  
      };  
    }  

    try {  
      const response = await axios.post(`${nordVPN.api.base.url}${nordVPN.api.endpoints.check}`,  
        { url },  
        {  
          headers: {  
            ...nordVPN.headers,  
            'authority': 'link-checker.nordvpn.com'  
          }  
        }  
      );  

      const result = response.data;  
      const status = result.status;  
      const cid = result.category;  
        
      const isSuccess = status === 0;  
      const isSafe = isSuccess && cid === 1;  
      const info = nordVPN.urlStatus[cid] || "URL is new, no information available yet";  

      return {  
        success: true,  
        code: 200,  
        result: {  
          status: `${nordVPN.checkStatus[status]} (${status})`,  
          info: info,  
          isSafe: isSafe,  
          url: url,  
          id: cid  
        }  
      };  

    } catch (error) {  
      return {  
        success: false,  
        code: 400,  
        result: {  
          error: error.message  
        }  
      };  
    }
  }
};

const handler = async (m, { conn, args, usedPrefix, command }) => {
  const subcommand = args[0]?.toLowerCase();

  if (command === 'nvpn' || command === 'nordvpn') {  
    if (!subcommand) return conn.sendMessage(m.chat, { text: `Usage: *${usedPrefix}${command} file <file>/<url>*\n\n*${usedPrefix}${command} url* <web url>` }, { quoted: m });  
      
    if (subcommand === 'file') {  
      try {  
        let q = m.quoted ? m.quoted : m;  
        let mime = (q.msg || q).mimetype || '';  
        if (!mime) throw 'Please send or reply to a file with the command';  

        let media = await q.download();  
        if (!media) throw 'Failed to download file';  

        if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });  

        const fileName = `file_${Date.now()}.zip`;  
        const tmpFilePath = path.join(tmpDir, fileName);  
        fs.writeFileSync(tmpFilePath, media);  

        const result = await nordVPN.checkFile(tmpFilePath);  
        fs.unlinkSync(tmpFilePath);  

        if (!result.success) throw result.result.error;  

        const response = `*Original Name:* ${result.result.originalName}

File Name: ${fileName}
File Size: ${formatBytes(result.result.fileSize)}\n
SHA256: ${result.result.sha256}\n
Status: ${result.result.status}
Category: ${result.result.category}
Is Safe: ${result.result.isSafe ? '✅ Safe' : '❌ Dangerous'}`;

        return conn.sendMessage(m.chat, { text: response }, { quoted: m });  
      } catch (error) {  
        return conn.sendMessage(m.chat, { text: `${error.message || error}` }, { quoted: m });  
      }  
    }  

    if (subcommand === 'url') {  
      try {  
        const url = args[1];  
        if (!url) throw `*Example:* ${usedPrefix}${command} url https://google.com`;  

        const result = await nordVPN.checkUrl(url);  
        if (!result.success) throw result.result.error;  

        const response = `*Link:* ${result.result.url}

Status: ${result.result.status}
Info: ${result.result.info}
Is Safe: ${result.result.isSafe ? '✅ Safe' : '❌ Dangerous'}`;

        return conn.sendMessage(m.chat, { text: response }, { quoted: m });  
      } catch (error) {  
        return conn.sendMessage(m.chat, { text: `${error.message || error}` }, { quoted: m });  
      }  
    }  

    return conn.sendMessage(m.chat, { text: `Available commands: ${usedPrefix}${command} <file|url>` }, { quoted: m });  
  }
};

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i))).toFixed(2) + ' ' + sizes[i];
}

handler.help = ['nordvpn'];
handler.tags = ['tools'];
handler.command = ['nvpn', 'nordvpn'];
handler.limit = true;
export default handler;
