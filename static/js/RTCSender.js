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
    this.sendData = this.sendData.bind(this);
  }

  /**
   * We'll send this offer to the reciever.
   */
  async createOffer() {
    const self = this;

    return new Promise(async function (resolve, reject) {
      self.dataChannel = self.connection.createDataChannel(null);
      self.dataChannel.onopen = event => self.onConnectionEstablished(self.dataChannel);

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

  sendData(file) {
    try {
      const self = this;

      console.log(`File is ${[file.name, file.size, file.type, file.lastModified].join(' ')}`);
  
      if (file.size === 0) {
        closeDataChannels();
        return;
      }

      const chunkSize = 16384;
      const fileReader = new FileReader();      
      let offset = 0;

      fileReader.addEventListener('error', error => console.error('Error reading file:', error));
      fileReader.addEventListener('abort', event => console.log('File reading aborted:', event));
      fileReader.addEventListener('load', e => {
        console.log('FileRead.onload ', e);
        self.dataChannel.send(e.target.result);
        offset += e.target.result.byteLength;
        sendProgress.value = offset;

        if (offset < file.size) {
          readSlice(offset);
        }
      });

      fileReader.addEventListener('loadend', function() {
        console.log("ended loading!");
      })

      const readSlice = o => {
        console.log('readSlice ', o);
        const slice = file.slice(offset, o + chunkSize);
        fileReader.readAsArrayBuffer(slice);
      };

      readSlice(0);
    } catch (err) {
      console.error("Could not send file to the reciever!");
      throw err;
    }
  }  

  onConnectionEstablished(dataChannel) {
    console.log("[ + ] Connected!");
    window.setTimeout(() => dataChannel.send('hello'), 2000);
    dataChannel.onmessage = event => console.log('Received : ' + event.data);
  }
}