export const CMD_MESSAGE = 'msg'
export const CMD_JOIN_CHANNEL = 'join'
export const CMD_SET_NICK = 'nick'

const createCommand = (cmd, data) => ({
  command: cmd,
  data: data
})

export function messageCommand (message) {
  return createCommand(CMD_MESSAGE, message)
}
