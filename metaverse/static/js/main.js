var inputUsername = document.querySelector('#username');
var btnJoin = document.querySelector('#btn-join');

var username;

var websocket;

function websocketOnMessage(event){
    var parseData = JSON.parse(event.data);
    var message = parseData['message'];

    console.log('message:', message);
};

btnJoin.addEventListener('click', ()=> {
    username = inputUsername.value;

    console.log('username: ', username);
    if(username == ''){
        return;
    }

    inputUsername.value = "";
    inputUsername.disabled = true;
    inputUsername.style.visibility = 'hidden';

    btnJoin.disabled = true;
    btnJoin.style.visibility = 'hidden';

    var labelUsername = document.querySelector('#label-username');
    labelUsername.innerHTML = username;

    var loc = window.location;
    var wsStart = 'ws://';

    if (loc.protocol == 'https:'){
        wsStart = 'wss://';
    }

    var endPoint = wsStart + loc.host + loc.pathname;

    console.log("endPoint:", endPoint);

    websocket = new WebSocket(endPoint);

    websocket.addEventListener('open', (e) =>{
        console.log("Connection open");
    });

    websocket.addEventListener('meesage', websocketOnMessage);

   websocket.addEventListener('close', (e) =>{
        console.log("Connection Closed");
    });
    
    websocket.addEventListener('error', (e) =>{
        console.log("Error Occured");
    });

});

var localStream = new MediaStream();

const constraints = {
    'video':true,
    'audio':true
};

const localVideo = document.querySelector('#local-video');

var userMedia = navigator.mediaDevices.getUserMedia(constraints)
    .then(stream => {
        localStream = stream;
        localVideo.srcObject = localStream;
        localVideo.muted = true;
    })
    .catch(error =>{
        console.log("Error dectection: ", error);
    })
