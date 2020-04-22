class RTCClient {
  constructor() {
    this.connection = null;

    this.createConnection = this.createConnection.bind(this);
  }

  async createConnection() {
    // local connection
    this.connection = new RTCPeerConnection({ 'iceServers': [{ 'urls': ['stun:stun.l.google.com:19302'] }] });
  }    

  onSendChannelStateChange() {

  }
}