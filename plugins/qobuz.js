//scrape by daffa thanks brother 

import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { tmpdir } from 'os';

const API = 'https://eu.qobuz.squid.wtf/api';
const UA = 'Postify/1.0.0';

function getAlbumId(url) {
  const match = url.match(/\/album\/.*?\/([a-zA-Z0-9]+)$/);
  return match ? match[1] : null;
}

function qualities(bit, rate) {
  const q = [
    { id: '5', label: 'MP3 320kbps' },
    { id: '6', label: 'CD Quality (FLAC 16bit)' },
  ];
  if (bit >= 24) q.push({ id: '7', label: 'Hi-Res 24bit/96kHz' });
  if (rate >= 192000) q.push({ id: '27', label: 'Hi-Res+ 192kHz' });
  return q;
}

async function searchTrack(query) {
  const { data } = await axios.get(`${API}/get-music`, {
    params: { q: query, offset: 0 },
    headers: { 'user-agent': UA },
  });
  const track = data?.data?.tracks?.items?.[0];
  if (!track) throw 'Track not found.';
  return track;
}

async function fetchAlbum(id) {
  const { data } = await axios.get(`${API}/get-album`, {
    params: { album_id: id },
    headers: { 'user-agent': UA },
  });
  const album = data?.data;
  if (!album?.tracks?.items?.length) throw 'Album is empty.';
  return album;
}

async function fetchDownload(trackId, quality) {
  const { data } = await axios.get(`${API}/download-music`, {
    params: { track_id: trackId, quality },
    headers: { 'user-agent': UA },
  });
  const url = data?.data?.url;
  if (!url) throw 'Download link not available.';
  return url;
}

async function downloadToTemp(url, name = 'track.flac') {
  const temp = path.join(tmpdir(), name);
  const res = await axios({ url, method: 'GET', responseType: 'stream' });
  const writer = fs.createWriteStream(temp);
  await new Promise((resolve, reject) => {
    res.data.pipe(writer);
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
  return temp;
}

const handler = async (m, { text, args, conn }) => {
  try {
    const input = (text || args.join(' ')).trim();
    if (!input) throw 'Please enter a title or album link.';

    let quality = '6';
    if (args[1] && /^[567]|27$/.test(args[1])) quality = args[1];

    let track, album;
    if (input.includes('qobuz.com/album/')) {
      const id = getAlbumId(input);
      if (!id) throw 'Invalid album ID.';
      album = await fetchAlbum(id);
    } else {
      track = await searchTrack(input);
      album = await fetchAlbum(track.album.id);
    }

    const q = qualities(
      Math.max(...album.tracks.items.map(t => t.maximum_bit_depth || 0)),
      Math.max(...album.tracks.items.map(t => t.maximum_sampling_rate || 0))
    );

    if (!q.find(q => q.id === quality)) {
      throw `Invalid quality: "${quality}". Available: ${q.map(q => q.id).join(', ')}`;
    }

    await m.reply(`Fetching songs from *${album.title}*...`);

    for (const tr of album.tracks.items) {
      const url = await fetchDownload(tr.id, quality);
      const file = await downloadToTemp(url, `${tr.title}.flac`);

      const caption = `🎵 *${tr.title}*\n👤 *${tr.performer?.name || 'Unknown Artist'}*\n💿 *${album.title}*\n🎧 *${q.find(q => q.id === quality)?.label || 'Unknown Quality'}*`;

      await conn.sendMessage(m.chat, { text: caption }, { quoted: m });

      await conn.sendMessage(m.chat, {
        audio: { url: file },
        mimetype: 'audio/mp4',
        ptt: false,
      }, { quoted: m });
    }

  } catch (e) {
    await m.reply(`*Error:* ${e.message || e}`);
  }
};

handler.help = ['qobuz'];
handler.tags = ['downloader'];
handler.command = ['qobuz'];
handler.limit = true 
export default handler;
