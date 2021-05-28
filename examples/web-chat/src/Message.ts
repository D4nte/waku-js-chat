import { ChatMessage, WakuMessage } from 'js-waku';

export class Message {
  public chatMessage: ChatMessage;
  // WakuMessage timestamp
  public sentTimestamp: Date | undefined;

  constructor(chatMessage: ChatMessage, sentTimestamp: Date | undefined) {
    this.chatMessage = chatMessage;
    this.sentTimestamp = sentTimestamp;
  }

  static fromWakuMessage(wakuMsg: WakuMessage): Message | undefined {
    if (wakuMsg.payload) {
      const chatMsg = ChatMessage.decode(wakuMsg.payload);
      if (chatMsg) {
        return new Message(chatMsg, wakuMsg.timestamp);
      }
    }
    return;
  }

  static fromUtf8String(nick: string, text: string): Message {
    const now = new Date();
    return new Message(ChatMessage.fromUtf8String(now, nick, text), now);
  }

  get nick() {
    return this.chatMessage.nick;
  }

  get timestamp() {
    return this.chatMessage.timestamp;
  }

  get payloadAsUtf8() {
    return this.chatMessage.payloadAsUtf8;
  }
}
