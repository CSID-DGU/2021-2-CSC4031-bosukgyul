var mapPeers = {};
var webSocket;
// consumers에서 정의된 send_message를 받았을 때
var username = document.querySelector('#label-username').innerHTML;

function webSocketOnMessage(event){
    var parseData = JSON.parse(event.data);
    var peerUsername = parseData['peer'];
    var action = parseData['action'];

    if (username == peerUsername){
        console.log(username);
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

var InputUsername = document.querySelector('#username');
var btnJoin = document.querySelector('#btn-join');
var loc = window.location;
var wsStart = 'ws://';

if (loc.protocol == 'https:'){
    wsStart = 'wss://';
}

var endPoint = wsStart + loc.host +loc.pathname;

webSocket = new WebSocket(endPoint);
console.log(endPoint);
webSocket.addEventListener('open', (e) => {
    sendSignal('new-peer',{});

});

webSocket.addEventListener('close', (e) => {
    console.log("Connection Closed");
});
webSocket.addEventListener('message', webSocketOnMessage);
webSocket.addEventListener('error', (e) => {
    console.log("Error Occured" + e);
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

function deletionEmoj(){
    var dataChannels = getDataChannels(); 
    
    for (index in dataChannels){
        dataChannels[index].send(emojMsg);
    }
}
window.addEventListener('unload', deletionEmoj);

var emoj = document.querySelector('#label-container');
var emojSend = document.querySelector('#emoticon-send');
var prior;

//emojSend.addEventListener('click', checkHand);
setInterval(checkHand, 2000);

function checkHand(){
    var emojMsg = emoj.textContent;

    if (emojMsg == "Hand"){
        console.log(btnToggleAudio.innerHTML);
        if (btnToggleAudio.innerHTML == "Audio Mute"){
            var mic_setting = confirm('마이크를 끄시겠습니까?');
        }
        else if (btnToggleAudio.innerHTML == "Audio UnMute"){
            var mic_setting = confirm('마이크를 켜시겠습니까?');
        }
        
        if (mic_setting == true){
            btnToggleAudio.click();
        }
    }

}

var progressBarHappy = $('.progress-bar-success');
var progressNumberHappy = 0;
var progressBarNeutral = $('.progress-bar-info');
var progressNumberNeutral = 0;
var progressBarNone = $('.progress-bar-warning');
var progressNumberNone = 0;
var progressBarSurprise = $('.progress-bar-danger');
var progressNumberSurprise = 0;
var bar;

setInterval(sendEmoj, 2000);
// btnSendMsg.addEventListener('click', sendMsgOnclick);
emojSend.addEventListener('click', sendEmoj);

function sendEmoj(){
    var emojMsg = emoj.textContent;

    var feelings_happy = document.querySelector('#feelings-happy');
    var feelings_none = document.querySelector('#feelings-none');
    var feelings_neutral = document.querySelector('#feelings-neutral');
    var feelings_surprise = document.querySelector('#feelings-surprise');

    var dataChannels = getDataChannels();
    var total = dataChannels.length+1;

    if (prior != null && emojMsg != 'Hand'){
        prior.innerHTML = String(parseInt(prior.innerHTML)-1);

        if(bar=="happy") {
             progressNumberHappy = (parseInt(prior.innerHTML))*100/total;
             progressBarHappy.css('width', progressNumberHappy+'%');
             progressBarHappy.attr('aria-valuenow', progressNumberHappy);
        }
        else if(bar=="neutral") {
            progressNumberNeutral = (parseInt(prior.innerHTML))*100/total;
            progressBarNeutral.css('width', progressNumberNeutral+'%');
            progressBarNeutral.attr('aria-valuenow', progressNumberNeutral);
        }
        else if(bar=="none") {
            progressNumberNone = (parseInt(prior.innerHTML))*100/total;
            progressBarNone.css('width', progressNumberNone+'%');
            progressBarNone.attr('aria-valuenow', progressNumberNone);
        }
        else if(bar=="surprise") {
            progressNumberSurprise = (parseInt(prior.innerHTML))*100/total;
            progressBarSurprise.css('width', progressNumberSurprise+'%');
            progressBarSurprise.attr('aria-valuenow', progressNumberSurprise);
        }

    }

    if (emojMsg == "Happy"){
        prior = feelings_happy;
        feelings_happy.innerHTML = String(parseInt(feelings_happy.innerHTML)+1);
        progressNumberHappy = (parseInt(feelings_happy.innerHTML))*100/total;
        progressBarHappy.css('width', progressNumberHappy+'%');
        progressBarHappy.attr('aria-valuenow', progressNumberHappy);
        bar = "happy";
    }
    else if (emojMsg == "Neutral"){
        prior = feelings_neutral;
        feelings_neutral.innerHTML = String(parseInt(feelings_neutral.innerHTML)+1);
        progressNumberNeutral = (parseInt(feelings_neutral.innerHTML))*100/total;
        progressBarNeutral.css('width', progressNumberNeutral+'%');
        progressBarNeutral.attr('aria-valuenow', progressNumberNeutral);
        bar = "neutral";
    }
    else if (emojMsg == "None"){
        prior = feelings_none;
        feelings_none.innerHTML = String(parseInt(feelings_none.innerHTML)+1);
        progressNumberNone = (parseInt(feelings_none.innerHTML))*100/total;
        progressBarNone.css('width', progressNumberNone+'%');
        progressBarNone.attr('aria-valuenow', progressNumberNone);
        bar = "none";
    }
    else if (emojMsg == "Surprise"){
        prior = feelings_surprise;
        feelings_surprise.innerHTML = String(parseInt(feelings_surprise.innerHTML)+1);
        progressNumberSurprise = (parseInt(feelings_surprise.innerHTML))*100/total;
        progressBarSurprise.css('width', progressNumberSurprise+'%');
        progressBarSurprise.attr('aria-valuenow', progressNumberSurprise);
        bar = "surprise";
    }

    for (index in dataChannels){
        dataChannels[index].send(emojMsg);
    }

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

var dc_prior;

function dcOnMessage(event){
    var emojMsg = event.data;

    var feelings_happy = document.querySelector('#feelings-happy');
    var feelings_none = document.querySelector('#feelings-none');
    var feelings_neutral = document.querySelector('#feelings-neutral');
    var feelings_surprise = document.querySelector('#feelings-surprise');

    if (dc_prior != null){
        dc_prior.innerHTML = String(parseInt(dc_prior.innerHTML)-1);
    }

    if (emojMsg == "Happy"){
        dc_prior = feelings_happy;
        feelings_happy.innerHTML = String(parseInt(feelings_happy.innerHTML)+1);
    }
    else if (emojMsg == "Neutral"){
        dc_prior = feelings_neutral;
        feelings_neutral.innerHTML = String(parseInt(feelings_neutral.innerHTML)+1);
    }
    else if (emojMsg == "None"){
        dc_prior = feelings_none;
        feelings_none.innerHTML = String(parseInt(feelings_none.innerHTML)+1);
    }
    else if (emojMsg == "Surprise"){
        dc_prior = feelings_surprise;
        feelings_surprise.innerHTML = String(parseInt(feelings_surprise.innerHTML)+1);
    }
}

var attendee = 1;

var mainGridContainer = document.querySelector('#main-grid-container');

function createVideo(peerUsername){

    attendee += 1;
    if(attendee<5){
        mainGridContainer.style.gridTemplateColumns = "repeat(4, 1fr)";
    }else{
        mainGridContainer.style.gridTemplateColumns = "repeat(6, 1fr)";
    }

    // var videoContainer = document.querySelector('#main-grid-container');
    var remoteVideo = document.createElement('video');
    remoteVideo.id = peerUsername + '-video';
    remoteVideo.autoplay = true;
    remoteVideo.playsinline = true;

    //user name below
    var videoName = document.createElement('p');
    videoName.style.fontSize = "15px"
    videoName.innerHTML = peerUsername;

    var videoWrapper = document.createElement('div');
    mainGridContainer.appendChild(videoWrapper);

    videoWrapper.appendChild(videoName);
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