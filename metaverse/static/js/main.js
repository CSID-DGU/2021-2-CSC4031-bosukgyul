var mapPeers = {};
var webSocket;
// consumers에서 정의된 send_message를 받았을 때

function webSocketOnMessage(event){
    var parseData = JSON.parse(event.data);
    var peerUsername = parseData['peer'];
    var action = parseData['action'];

    if (username == peerUsername){
        return;
    }

    var receiver_channel_name = parseData['message']['receiver_channel_name'];

    if (action == "new-peer"){
        createOfferer(peerUsername, receiver_channel_name);
        return;
    }

    if (action == 'new-offer'){
        var offer = parseData['message']['sdp'];
        createAnswerer(offer, peerUsername, receiver_channel_name);
    }

    if (action == 'new-answer'){
        var answer = parseData['message']['sdp'];
        var peer = mapPeers[peerUsername][0];

        peer.setRemoteDescription(answer);

        return;
    }

}

var labelUsername = document.querySelector('#label-username');
var InputUsername = document.querySelector('#username');
var btnJoin = document.querySelector('#btn-join');

var username;

btnJoin.addEventListener('click', () =>{
    username = InputUsername.value;

    console.log(username);

    if (username == ''){
        return;
    }

    InputUsername.value = '';
    InputUsername.disabled = true;
    InputUsername.style.visibility = 'hidden';

    btnJoin.disabled = true;
    btnJoin.style.visibility = 'hidden';

    var labelUsername = document.querySelector('#label-username');
    labelUsername.innerHTML = username;

    var loc = window.location;
    var wsStart = 'ws://';

    if (loc.protocol == 'https:'){
        wsStart = 'wss://';
    }
    // 여기 pathname만 변경하기
    var endPoint = wsStart + loc.host + loc.pathname;

    console.log("endPoint:", endPoint);

    webSocket = new WebSocket(endPoint);

    webSocket.addEventListener('open', (e) => {
        console.log("Connection Opened");
        sendSignal('new-peer',{});

    });

    webSocket.addEventListener('close', (e) => {
        console.log("Connection Closed");
    });
    webSocket.addEventListener('message', webSocketOnMessage);
    webSocket.addEventListener('error', (e) => {
        console.log("Error Occured");
    });


});

var localStream = new MediaStream();

const constraints = {
    'video' : true,
    'audio': true,
}

const localVideo = document.querySelector('#local-video');
const btnToggleAudio = document.querySelector('#btn-toggle-audio');
const btnToggleVideo= document.querySelector('#btn-toggle-video');

var userMedia = navigator.mediaDevices.getUserMedia(constraints)
    .then(stream => {
        localStream = stream;
        localVideo.srcObject = localStream;
        localVideo.muted = true;

        var audioTracks = stream.getAudioTracks();
        var videoTracks = stream.getVideoTracks();
        var video_setting = document.querySelector('#Vstatus');
        var audio_setting = document.querySelector('#Astatus');

        if (audio_setting.value  == '0'){
            audioTracks[0].enabled = false;
        }
        else{
            audioTracks[0].enabled = true;
        }

        if (video_setting.value == '0'){
            videoTracks[0].enabled = false;
        }
        else{
            videoTracks[0].enabled = true;
        }

        btnToggleAudio.addEventListener('click', () => {
            console.log(audioTracks);
            audioTracks[0].enabled = !audioTracks[0].enabled;

            if (audioTracks[0].enabled){
                btnToggleAudio.innerHTML = 'Audio Mute';
                return;
            }
            btnToggleAudio.innerHTML = 'Audio UnMute';
        });


        btnToggleVideo.addEventListener('click', () => {
            videoTracks[0].enabled = !videoTracks[0].enabled;

            if (videoTracks[0].enabled){
                btnToggleVideo.innerHTML = 'Video OFF';
                return;
            }
            btnToggleVideo.innerHTML = 'Video ON';

        });
    })
    .catch(error => {
        console.log(error);
    }) 

var btnSendMsg = document.querySelector('#btn-send-msg');
var messageList = document.querySelector('#message-list');
var messageInput = document.querySelector('#msg');
var emoj = document.querySelector('#label-container');
var emojSend = document.querySelector('#emoticon-send');

btnSendMsg.addEventListener('click', sendMsgOnclick);
setInterval(sendEmoj, 2000);

function sendEmoj(){
    var emojMsg = emoj.textContent;

    var li = document.createElement('li');
    li.appendChild(document.createTextNode('My Feelings:' + emojMsg));
    messageList.appendChild(li);

    var dataChannels = getDataChannels();

    message = username + '\'s Feeling: '+ emojMsg;
    
    for (index in dataChannels){
        dataChannels[index].send(message);
    }

}
function sendMsgOnclick(){
    var message = messageInput.value;

    var li = document.createElement('li');
    li.appendChild(document.createTextNode('Me: '+ message));
    messageList.appendChild(li);

    var dataChannels = getDataChannels();

    message = username + ' : ' + message;


    for(index in dataChannels) {
        dataChannels[index].send(message);
    }

    messageInput.value = '';
}

function sendSignal(action, message){
    var jsonStr = JSON.stringify({
        'peer' : username,
        'action' : action,
        'message' :message,   
    });

    webSocket.send(jsonStr);
}

function createOfferer(peerUsername, receiver_channel_name){
    var peer = new RTCPeerConnection(null);

    addLocalTracks(peer);

    var dc = peer.createDataChannel('channel');
    dc.addEventListener('open', ()=>{
        console.log('Connection opended!');
    });

    dc.addEventListener('message', dcOnMessage);

    var remoteVideo = createVideo(peerUsername);
    setOnTrack(peer, remoteVideo);

    mapPeers[peerUsername] = [peer, dc];

    peer.addEventListener('iceconnectionstatechange', ()=>{
        var iceConnectionState = peer.iceConnectionState;

        if (iceConnectionState === 'failed' || iceConnectionState === 'disconnected'|| iceConnectionState ==='closed' ){
            delete mapPeers[peerUsername];

            if (iceConnectionState != 'closed'){
                peer.close();
            }

            removeVideo(remoteVideo);
        }
    });
    
    peer.addEventListener('icecandidate', (event) => {
        if (event.candidate){
            console.log("new ice candidate, ", JSON.stringify(peer.localDescription));
            return;
        }

        sendSignal('new-offer', {
            'sdp': peer.localDescription,
            'receiver_channel_name' : receiver_channel_name              
        });
    }); 

    peer.createOffer()
        .then( o => peer.setLocalDescription(o))
        .then(()=>{
            console.log('Local Description set successfully');
        })
}

function createAnswerer(offer, peerUsername, receiver_channel_name){
    var peer = new RTCPeerConnection(null);

    addLocalTracks(peer);

    var remoteVideo = createVideo(peerUsername);
    setOnTrack(peer, remoteVideo);

    peer.addEventListener('datachannel', e => {
        peer.dc = e.channel;
        peer.dc.addEventListener('open', ()=>{
        console.log('Connection opended!');
            });

        peer.dc.addEventListener('message', dcOnMessage);
        mapPeers[peerUsername] = [peer, peer.dc];

    });

    peer.addEventListener('iceconnectionstatechange', ()=>{
        var iceConnectionState = peer.iceConnectionState;

        if (iceConnectionState === 'failed' || iceConnectionState === 'disconnected'|| iceConnectionState ==='closed' ){
            delete mapPeers[peerUsername];

            if (iceConnectionState != 'closed'){
                peer.close();
            }

            removeVideo(remoteVideo);
        }
    });
    
    peer.addEventListener('icecandidate', (event) => {
        if (event.candidate){
            console.log("new ice candidate, ", JSON.stringify(peer.localDescription));
            return;
        }

        sendSignal('new-answer', {
            'sdp': peer.localDescription,
            'receiver_channel_name' : receiver_channel_name              
        });
    }); 

    peer.setRemoteDescription(offer)
        .then(() => {
            console.log('Remote description set successfully for %s', peerUsername)

            return peer.createAnswer();
        })

        .then(a => {
            console.log("Answer created!");

            peer.setLocalDescription(a);
        })
}

function addLocalTracks(peer){
    localStream.getTracks().forEach(track=>{
        peer.addTrack(track, localStream);
    });

    return;
}


function dcOnMessage(event){
    var message = event.data;

    var li = document.createElement('li');
    li.appendChild(document.createTextNode(message));
    messageList.appendChild(li);
}

var attendee = 0;
var mainGridContainer = document.querySelector('#main-grid-container');

function createVideo(peerUsername){

    attendee += 1;
    if(attendee<4){
        mainGridContainer.style.gridTemplateColumns = "repeat(2, 1fr)";
    }else{
        mainGridContainer.style.gridTemplateColumns = "repeat(3, 1fr)";
    }

    //var videoContainer = document.querySelector('#main-grid-container');
    var remoteVideo = document.createElement('video');
    remoteVideo.id = peerUsername + '-video';
    remoteVideo.autoplay = true;
    remoteVideo.playsinline = true;

    var videoWrapper = document.createElement('div');
    mainGridContainer.appendChild(videoWrapper);

    videoWrapper.appendChild(remoteVideo);
    
    return remoteVideo;

}

function setOnTrack(peer, remoteVideo){
    var remoteStream = new MediaStream();

    remoteVideo.srcObject = remoteStream;
    peer.addEventListener('track', async (event) => {
        remoteStream.addTrack(event.track, remoteStream);

    });
}

function removeVideo(video){
    var videoWrapper = video.parentNode;

    videoWrapper.parentNode.removeChild(videoWrapper);
}

function getDataChannels(){
    var dataChannels = [];

    for(peerUsername in mapPeers){
        var dataChannel = mapPeers[peerUsername][1];

        dataChannels.push(dataChannel);
    }

    return dataChannels;
}