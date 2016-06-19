class RedisStore {
  constructor (redis, codec) {
    this.redis = redis
    this.codec = codec
  }
}

export default RedisStore
