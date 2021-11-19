var localStream = new MediaStream();

const constraints = {
    'video' :true,
    'audio': true,
}

const localVideo = document.querySelector('#local-video');
const btnToggleAudio = document.querySelector('#btn-toggle-audio');
const btnToggleVideo= document.querySelector('#btn-toggle-video');
const AudioStatus = document.querySelector('#audio-status-check');
const VideoStatus = document.querySelector('#video-status-check');

var userMedia = navigator.mediaDevices.getUserMedia(constraints)
    .then(stream => {
        localStream = stream;
        localVideo.srcObject = localStream;
        localVideo.muted = true;

        var audioTracks = stream.getAudioTracks();
        var videoTracks = stream.getVideoTracks();

        audioTracks[0].enabled = true;
        videoTracks[0].enabled = true;

        btnToggleAudio.addEventListener('click', () => {
            console.log(AudioStatus);
            audioTracks[0].enabled = !audioTracks[0].enabled;

            if (audioTracks[0].enabled){
                AudioStatus.value = "1";
                btnToggleAudio.innerHTML = 'Audio Mute';
                return;
            }
            btnToggleAudio.innerHTML = 'Audio UnMute';
            AudioStatus.value="0";
        });


        btnToggleVideo.addEventListener('click', () => {
            videoTracks[0].enabled = !videoTracks[0].enabled;

            if (videoTracks[0].enabled){
                VideoStatus.value = '1';
                btnToggleVideo.innerHTML = 'Video OFF';
                return;
            }
            btnToggleVideo.innerHTML = 'Video ON';
            VideoStatus.value='0';

        });
    })
    .catch(error => {
        console.log(error);
    }) 

