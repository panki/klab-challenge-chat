export class JsonCodec {
  static pack (obj) {
    return JSON.stringify(obj)
  }

  static unpack (string) {
    return JSON.parse(string)
  }
}
