
let sentMessages = new Array<any>()

export = {
  __resetMessages () {
    sentMessages = []
    return sentMessages
  },
  messaging () {
    return {
      async send (msg: any) { sentMessages.push(msg) }
    }
  }
}
