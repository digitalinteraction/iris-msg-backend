
let sentMessages = new Array<any>()

export = {
  __resetMessages () {
    sentMessages = []
    return sentMessages
  },
  messaging () {
    return {
      send (msg: any) { sentMessages.push(msg) }
    }
  }
}
