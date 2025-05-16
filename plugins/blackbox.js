//Share Code Team By Ponta Sensei
//edited by Noureddine_Ouafy 

import fs from 'fs'
import path from 'path'
import fetch from 'node-fetch'

const SESSION_FILE_PATH = './src/blackboxsessions.json'
const SESSION_DIR = path.dirname(SESSION_FILE_PATH)
const SESSION_TIMEOUT = 60 * 60 * 1000 // 1 hour

// Create directory if it doesn't exist
if (!fs.existsSync(SESSION_DIR)) {
  fs.mkdirSync(SESSION_DIR, { recursive: true })
}

// Create session file if it doesn't exist
if (!fs.existsSync(SESSION_FILE_PATH)) {
  fs.writeFileSync(SESSION_FILE_PATH, JSON.stringify({}, null, 2))
}

let userSessions = {}
try {
  userSessions = JSON.parse(fs.readFileSync(SESSION_FILE_PATH, 'utf8'))
} catch {
  userSessions = {}
}

let userTimeouts = {}

async function blackbox(query, userId) {
  if (!Array.isArray(userSessions[userId])) {
    userSessions[userId] = []
  }

  // Reset session if timeout exceeded
  if (userSessions[userId].length > 0) {
    const lastMessageTime = new Date(userSessions[userId].slice(-1)[0].waktu)
    if (Date.now() - lastMessageTime.getTime() > SESSION_TIMEOUT) {
      userSessions[userId] = []
    }
  }

  userSessions[userId].push({
    role: 'user',
    content: query,
    waktu: new Date().toISOString()
  })

  try {
    const res = await fetch('https://pontafly.vercel.app/api/ai/blackbox', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    })

    const json = await res.json()
    if (!json.status || !json.result?.response) {
      throw 'Failed to get response from Blackbox API.'
    }

    const aiResponse = json.result.response

    userSessions[userId].push({
      role: 'assistant',
      content: aiResponse,
      waktu: new Date().toISOString()
    })

    fs.writeFileSync(SESSION_FILE_PATH, JSON.stringify(userSessions, null, 2))

    if (userTimeouts[userId]) clearTimeout(userTimeouts[userId])
    userTimeouts[userId] = setTimeout(() => {
      delete userSessions[userId]
      delete userTimeouts[userId]
      fs.writeFileSync(SESSION_FILE_PATH, JSON.stringify(userSessions, null, 2))
    }, SESSION_TIMEOUT)

    return aiResponse
  } catch (error) {
    console.error(error)
    return 'An error occurred while processing your request. Please try again later.'
  }
}

let handler = async (m, { text, usedPrefix, command }) => {
  const userId = m.sender

  if (!text) throw `Use the format:\n${usedPrefix + command} <your question>`

  await conn.sendMessage(m.chat, { react: { text: '🚀', key: m.key } })

  let response = await blackbox(text, userId)

  await conn.sendMessage(m.chat, { text: response }, { quoted: m })

  await conn.sendMessage(m.chat, { react: { text: null, key: m.key } })
}

handler.help = ['blackbox']
handler.tags = ['ai']
handler.command = /^blackbox$/i
handler.limit = true
export default handler
