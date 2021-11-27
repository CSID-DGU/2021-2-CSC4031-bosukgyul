const URL = "https://teachablemachine.withgoogle.com/models/qlKg3vZp9/";

let model, maxPredictions, predict_result, labelContainer;
init();

// Load the image model
async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    // model load test
    console.log("model load ok");

    // setInterval(loop, 3000);
    window.requestAnimationFrame(loop);
}

// video load
// let count = 0;
async function loop() {
/* ai prediction count control
    if(count % 7 == 0) {
        const localVideo = document.querySelector('#local-video');
        await predict();
    }
    count++;
*/
    const localVideo = document.querySelector('#local-video');
    await predict();
    window.requestAnimationFrame(loop);
}

// model predict
labelContainer = document.querySelector('#label-container');
async function predict() {
    const prediction = await model.predict(localVideo);

    if(prediction[1].probability >= 0.2) {
        predict_result = prediction[1].className;
        labelContainer.innerHTML = "Happy";
        //document.getElementById("emoticon").src = "../../../static/css/img/happy.jpg"
        // console.log(predict_result);
    }
    else if(prediction[0].probability >= 0.8) {
        predict_result = prediction[0].className;
        labelContainer.innerHTML = "Neutral";
        //document.getElementById("emoticon").src = "../../../static/css/img/neutral.jpg"
        // console.log(predict_result);
    }
    else if(prediction[2].probability >= 0.4) {
        predict_result = prediction[2].className;
        labelContainer.innerHTML = "Surprise";
        //document.getElementById("emoticon").src = "../../../static/css/img/surprise.jpg"
        // console.log(predict_result);
    }
    else if(prediction[3].probability >= 0.2) {
        predict_result = prediction[3].className;
        labelContainer.innerHTML = "Hand";
        // console.log(predict_result);
    }
    else if(prediction[4].probability >= 0.3) {
        predict_result = prediction[4].className;
        labelContainer.innerHTML = "None";
        // console.log(predict_result);
    }
    else {
        predict_result = "none";
        labelContainer.innerHTML = "None";
        // console.log(predict_result);
    }
}