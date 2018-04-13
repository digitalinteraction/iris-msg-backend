
type Message = {
  to: String, from: String, body: String
}
let sentMessages = new Array<Message>()

const client = {
  __resetMessages () {
    sentMessages = []
    return sentMessages
  },
  messages: {
    async create (msg: Message) { sentMessages.push(msg) }
  }
}

export = function () { return client }
