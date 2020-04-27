/**
 * Reciever
 * 
 */
class RTCReciever {
  constructor() {
    this.connection = new RTCPeerConnection({ 'iceServers': [{ 'urls': ['stun:stun.l.google.com:19302'] }] });
    this.dataChannel = null;

    this.createAnswer = this.createAnswer.bind(this);
    this.onConnectionEstablished = this.onConnectionEstablished.bind(this);
  }

  /**
   * Create answer to the offer sender has sent.
   */
  async createAnswer(offer) {    
    if (!offer.length) {
      throw new Error("Description is empty!");
    }

    try {
      offer = JSON.parse(offer);
    } catch (err) {
      console.error("Could not parse remote description given by user!");
      throw err;
    }

    const self = this;

    return new Promise(async function(resolve, reject) {
      self.connection.ondatachannel = event => {
        event.channel.onopen = self.onConnectionEstablished(event.channel);
      };
  
      self.connection.setRemoteDescription(new RTCSessionDescription(offer));
      self.connection.setLocalDescription(await self.connection.createAnswer());
      self.connection.oniceconnectionstatechange = () =>
        console.log('Connection status: ' + self.connection.iceConnectionState);
  
      self.connection.onicegatheringstatechange = () => {
          if (self.connection.iceGatheringState !== 'complete') return;          
          resolve(self.connection.localDescription);
      };
    });    
  }

  onConnectionEstablished(dataChannel) {
    console.log("[ + ] Connected!");
    window.setTimeout(() => dataChannel.send('hello'), 2000);
    dataChannel.onmessage = event => console.log('Received : ' + event.data);
  }
}