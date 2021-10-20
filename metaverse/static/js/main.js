var mapPeers = {};
var inputUsername = document.querySelector('#username');
var btnJoin = document.querySelector('#btn-join');

var username;
var websocket;

function websocketOnMessage(event){
    var parseData = JSON.parse(event.data);
    var peerUsername = parseData['peer'];
    var action = parseData['action'];

    if (username == peerUsername){
        return;
    }

    var recevier_channel_name = parseData['message']['recevier_channel_name'];

    if (action == 'new-peer'){
        // offer sdp 생성 
        createOfferer(peerUsername, recevier_channel_name);

        return 
    }

    if (action == 'new=offer'){
        var offer = parseData['message']['sdp'];
        createAnswerer(offer, peerUsername, recevier_channel_name);

        return ;
    }

    if (action == 'new-answer'){
        var answer = parseData['message'['sdp'];

        var peer = mapPeers[peerUsername][0];

        peer.setRemoteDescription(answer);

        return;
    }
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

        sendSignal('new-peer', {});
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
const btnToggleAudio = document.querySelector('#btn-toggle-audio');
const btnToggleVideo = document.querySelector('#btn-toggle-video');

var userMedia = navigator.mediaDevices.getUserMedia(constraints)
    .then(stream => {
        localStream = stream;
        localVideo.srcObject = localStream;
        localVideo.muted = true;

        var audioTracks = stream.getAudioTracks();
        var videoTracks = stream.getVideoTracks();

        audioTracks[0].enabled = true;
        videoTracks[0].enabled = true;

        btnToggleAudio.addEventListener('click', ()=>
        {
            audioTracks[0].enabled = !audioTracks[0].enabled;

            if (audioTracks[0].enabled){
                btnToggleAudio.innerHTML = 'Audio Mute';
                return;
            }
            btnToggleAudio.innerHTML ='Audio UnMute';
        })

        btnToggleVideo.addEventListener('click', ()=>
        {
            videoTracks[0].enabled = !videoTracks[0].enabled;

            if (videoTracks[0].enabled){
                btnToggleVideo.innerHTML = 'Video OFF';
                return;
            }
            btnToggleAudio.innerHTML ='Video ON';
        })
    })
    .catch(error =>{
        console.log("Error dectection: ", error);
    })

function sendSignal(action, message){

    var jsonStr = JSON.stringify({
        'peer':username, 
        'action': action,
        'message' : message,
    });
    
    websocket.send(jsonStr);
}

function createOfferer(peerUsername, recevier_channel_name){
    // in different scope => turn, sturn server 설정해서 dictionary 설정
    var peer = new RTCPeerConnection(nul);

    addLocalTracks(peer);

    var dc = peer.createDataChannel('channel');
    dc.addEventListener('open', ()=>{
        console.log(
            'connection opened!'
        );
    })

    dc.addEventListener('message', dcOnMessage);

    var remoteVideo = createVideo(peerUsername);
    setOnTrack(peer, remoteVideo);

    mapPeers[peerUsername] = [peer, dc];

    peer.addEventListener('iceconnectionstatechange', ()=>{
        var iceconnectionstate = peer.iceConnectionState;

        if (iceconnectionstate == 'failed' || iceConnectionState =='disconnected' || iceConnectionState == 'closed'){
            delete mapPeers[peerUsername];

            if(iceConnectionState != 'closed'){
                peer.close();
            }

            removeVideo(remoteVideo);
        }
    })

    peer.addEventListener('icecandidate', (event)=>{
        if (event.candidate){
            console.log("new ice candidate", JSON.stringify(peer.localDescription));

            return;
        }

        sendSignal('new-offer', {
            'sdp' : peer.localDescription,
            'receiver_channel_name': recevier_channel_name
        });
    });

    peer.createOffer()
        .then(o => peer.setLocalDescription(o))
        .then(()=> {
            console.log('Local description set successfully.');
        });
    
}

function createAnswerer(offer, peerUsername, receiver_channel_name){
    var peer = new RTCPeerConnection(null);
    addLocalTracks(peer);

    var remoteVideo = createVideo(peerUsername);
    setOnTrack(peer, remoteVideo);

    peer.addEventListener('datachannel', e =>{
        peer.dc = e.channel
        peer.dc.addEventListener('open', ()=>{
            console.log(
                'connection opened!'
            );
        })
    
        peer.dc.addEventListener('message', dcOnMessage);
    })

    mapPeers[peerUsername] = [peer, peer.dc];

    peer.addEventListener('iceconnectionstatechange', ()=>{
        var iceconnectionstate = peer.iceConnectionState;

        if (iceconnectionstate == 'failed' || iceConnectionState =='disconnected' || iceConnectionState == 'closed'){
            delete mapPeers[peerUsername];

            if(iceConnectionState != 'closed'){
                peer.close();
            }

            removeVideo(remoteVideo);
        }
    })

    peer.addEventListener('icecandidate', (event)=>{
        if (event.candidate){
            console.log("new ice candidate", JSON.stringify(peer.localDescription));

            return;
        }

        sendSignal('new-answer', {
            'sdp' : peer.localDescription,
            'receiver_channel_name': recevier_channel_name
        });
    });

    peer.setRemoteDescription(offer)
        .then(()=>{
        console.log("Remote Description set successfully for %s", peerUsername);

        return eer.createAnswer();
         })

        .then(a =>  {
            console.log('Answer created');

            peer.setLocalDescription(a);
        })
}

function addLocalTracks(peer){
    localStream.getTracks().forEach(track => {
        peer.addTrack(track, localStream);
    });

    return; 
}

var messageList = document.querySelector('#message-list');
function dcOnMessage(event){
    var message = event.data;

    var li = document.createElement('li');
    li.appendChild(document.createTextNode(message));
    messageList.appendChild(li);
}

function createVideo(peerUsername){
    var videoContainer = document.querySelector('#video-container');
    var remoteVideo = document.createElement('video');

    remoteVideo.id = peerUsername + '-video';
    remoteVideo.autoplay = true;
    remoteVideo.playsInline = true;

    var videoWrapper = document.createElement('div');

    videoContainer.appendChild(videoWrapper);
    vidooWrapper.appendChild(remoteVideo);

    return remoteVideo;
}

function setOnTrack(peer, remoteVideo){
    var remoteStream = new MediaStream();

    remoteVideo.srcObject  = remoteStream;

    peer.addEventListener('track', async (event)=>{
        remoteStream.addTrack(event.track, remoteStream);
    });
}

function removeVideo(video){
    var videoWrapper = video.parentNode;

    videoWrapper.parentNode.removeChild(videoWrapper);
}