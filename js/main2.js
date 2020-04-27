(async function () {
  const sender = new RTCSender();
  const reciever = new RTCReciever();
  const createOfferBtn = () => document.querySelector("#create-offer-btn");
  const createAnswerBtn = () => document.querySelector("#create-ans-btn");
  const messageBox = () => document.querySelector("#message-box");
  const connectBtn = () => document.querySelector("#connect-btn");
  const fileInput = () => document.querySelector("#fileInput");
  const downloadAnchor = () => document.querySelector('a#download');
  const sendProgress = () => document.querySelector('progress#sendProgress');
  const receiveProgress = () => document.querySelector('progress#receiveProgress');
  const statusMessage = () => document.querySelector('span#status');
  const sendFileButton = () => document.querySelector('button#sendFile');


  // on click select all info.
  messageBox().addEventListener('click', (e) => {
    e.target.select();
  });
  


  // ==== Reciever functions ====
  createAnswerBtn().addEventListener('click', async () => {
    const offer = messageBox().value; // answer to offer.

    var answer = await reciever.createAnswer(offer);
    answer = JSON.stringify(answer);

    messageBox().value = answer;
    messageBox().scrollTop = 0;
  });



  // ==== Sender functions ====
  createOfferBtn().addEventListener('click', async () => {
    var offer = await sender.createOffer();
    offer = JSON.stringify(offer);

    messageBox().value = offer;
  });
  
  connectBtn().addEventListener('click', async () => {
    const remoteAnswer = messageBox().value;

    await sender.connect(remoteAnswer);

    messageBox().value = "connecting ...";
    messageBox().scrollTop = 0;
  });

  // when send button is clicked
  sendFileButton().addEventListener('click', () => {
    const file = fileInput().files[0];

    statusMessage().textContent = '';
    downloadAnchor().textContent = '';

    if (file.size === 0) {
      bitrateDiv.innerHTML = '';
      statusMessage().textContent = 'File is empty, please select a non-empty file';
    }

    sendProgress().max = file.size;
    receiveProgress().max = file.size;

    sender.sendData(file);
  });
})();