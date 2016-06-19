import EventEmitter from 'events'
import Redis from 'ioredis'
import {JsonCodec} from './codec'
import config from './config'

const MESSAGE_BUS = 'messages'

class RedisStore extends EventEmitter {
  constructor (redis, codec, options) {
    super()
    this.redis = redis || new Redis(config.redis)
    this.codec = codec || JsonCodec
    this.options = options || config.store
    this.prefixChannel = name => 'channel_' + name

    // For subscription we need a separate
    // redis connection instance
    this.subs_redis = this.redis.duplicate()
    this.subs_redis.subscribe(MESSAGE_BUS)

    // Handle messages from subscription
    this.subs_redis.on('message', (channel, message) => {
      const msg = this.codec.unpack(message)
      this.emit('message', msg)
    })
  }

  put (message) {
    const key = this.prefixChannel(message.channel)
    const msg = this.codec.pack(message)
    return this.redis.pipeline()
      // Insert new message to list head
      // because it will take O(1), and allows us
      // get last N messages in O(N)
      .lpush(key, msg)
      // Trim unnecessary messages
      .ltrim(key, 0, this.options.max_messages_per_channel - 1)
      // Update expire time of channel
      .expire(key, this.options.max_message_age)
      // Publish new message
      .publish(MESSAGE_BUS, msg)
      .exec()
  }

  publish (message) {
    const value = this.codec.pack(message)
    return this.redis.publish(MESSAGE_BUS, value)
  }

  getLastMessages (channel, n) {
    const key = this.prefixChannel(channel)
    // Unix utc timestamp in milliseconds, because message timestamp
    // in utc with milliseconds
    const minTimestamp = (
      Math.floor((new Date()).getTime() / 1000) -
      this.options.max_message_age
    ) * 1000
    return this.redis.lrange(key, 0, n - 1)
      .then(messages => {
        return messages
          // decode
          .map(m => this.codec.unpack(m))
          // skip expired messages
          .filter(m => new Date(m.timestamp).getTime() >= minTimestamp)
          // reverse in time ascending order
          .reverse()
      })
  }
}

export default RedisStore
