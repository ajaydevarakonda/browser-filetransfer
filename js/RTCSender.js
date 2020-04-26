/**
 * Sender
 * 
 */
class RTCSender {
  constructor() {
    this.connection = new RTCPeerConnection({ 'iceServers': [{ 'urls': ['stun:stun.l.google.com:19302'] }] });
    this.dataChannel = null;

    this.createOffer = this.createOffer.bind(this);
    this.connect = this.connect.bind(this);
    this.onConnectionEstablished = this.onConnectionEstablished.bind(this);
  }

  /**
   * We'll send this offer to the reciever.
   */
  async createOffer() {
    const self = this;

    return new Promise(async function (resolve, reject) {
      self.dataChannel = self.connection.createDataChannel(null);
      self.dataChannel.onopen = event => self.onConnectionEstablished(dataChannel);

      const localDesc = await self.connection.createOffer();
      self.connection.setLocalDescription(localDesc);
      self.connection.oniceconnectionstatechange = () =>
        console.log('Connection status: ' + self.connection.iceConnectionState);

      self.connection.onicegatheringstatechange = () => {
        if (self.connection.iceGatheringState !== 'complete')
          return;

        resolve(self.connection.localDescription);
      };
    });
  }

  /**
   * Set answer from reciever as remote description.
   * @params answer {Object}  Answer to the offer we sent.
   */
  connect(answer) {
    if (!answer.length) {
      throw new Error("Description is empty!");
    }

    try {
      answer = JSON.parse(answer);
    } catch (err) {
      console.error("Could not parse remote description given by user!");
      throw err;
    }

    return this.connection.setRemoteDescription(answer);
  }

  onConnectionEstablished(dataChannel) {
    window.setTimeout(() => dataChannel.send('hello'), 2000);
    dataChannel.onmessage = event => print('Received : ' + event.data);
  }
}