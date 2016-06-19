export const CMD_MESSAGE = 'msg'
export const CMD_JOIN_CHANNEL = 'join'
export const CMD_SET_NICK = 'nick'

// Message constructors

export function message (author, channel, text, timestamp) {
  return {
    author: author,
    channel: channel,
    text: text,
    timestamp: timestamp || new Date().toUTCString()
  }
}

export function sysMessage (channel, text) {
  return message('system', channel || 'system', text)
}

// Command constructors

const createCommand = (cmd, data) => ({
  command: cmd,
  data: data
})

export function messageCommand (author, channel, text, timestamp) {
  return createCommand(CMD_MESSAGE, message(author, channel, text, timestamp))
}

export function sysMessageCommand (channel, text) {
  return messageCommand('system', channel || 'system', text)
}
