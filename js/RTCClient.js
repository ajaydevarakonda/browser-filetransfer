class RTCClient {
  constructor() {
    this.connection = null;
    this.dataChannel = null;

    this.localDescription = this.localDescription.bind(this);
    this.onConnectionEstablished = this.onConnectionEstablished.bind(this);
  }

  async get localDescription() {
    return new Promise(function(resolve, reject) {
      // lazy creates new local connection
      this.connection = new RTCPeerConnection({ 'iceServers': [{ 'urls': ['stun:stun.l.google.com:19302'] }] });

      print('Initializing...');
      this.dataChannel = connection.createDataChannel(null);
      dataChannel.onopen = event => this.onConnectionEstablished(dataChannel);

      const localDesc = await connection.createOffer();
      connection.setLocalDescription(localDesc);
      connection.oniceconnectionstatechange = () =>
        print('Connection status: ' + connection.iceConnectionState);

      connection.onicegatheringstatechange = () => {
        if (connection.iceGatheringState !== 'complete')
          return;      
        
        resolve(connection.localDescription);
      };
    });
  }

  /**
   * Set remote description on rtc connection.
   * @params desc {Object}  webrtc remote description object.
   */
  async set remoteDescription(desc) {
    return connection.setRemoteDescription(desc);
  }

  onConnectionEstablished(dataChannel) {
    dataChannel.onmessage = event => print('Received : ' + event.data);
  }
}