const config = {
  redis: {
    host: process.env.REDIS_HOST || 'redis',
    port: 6379,
    db: 0
  },
  store: {
    max_message_age: 24 * 3600, // 24h in seconds
    max_messages_per_channel: 1000
  },
  messenger: {
    // The number of messages sent to the client
    // when joining to channel
    channel_history_size: 10
  }
}

export default config
