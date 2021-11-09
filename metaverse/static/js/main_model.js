const URL = "https://teachablemachine.withgoogle.com/models/qlKg3vZp9/";

let model, maxPredictions;
init();

// Load the image model
async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    // model load test
    // console.log("model load");

    window.requestAnimationFrame(loop);
}

// video load
async function loop() {
    const localVideo = document.querySelector('#local-video');
    await predict();
    window.requestAnimationFrame(loop);
}

// model predict
async function predict() {
    const prediction = await model.predict(localVideo);

//    if(prediction[1].probability >= 0.2) {
//        console.log(prediction[1].className);
//    }
//    else if(prediction[0].probability >= 0.8) {
//        console.log(prediction[0].className);
//    }
//    else if(prediction[2].probability >= 0.4) {
//        console.log(prediction[2].className);
//    }
//    else if(prediction[3].probability >= 0.2) {
//        console.log(prediction[3].className);
//    }
//    else if(prediction[4].probability >= 0.3) {
//        console.log(prediction[4].className);
//    }
//    else console.log("none");

//    console.log(prediction[0].probability);
    // for (let i = 0; i < maxPredictions; i++) {
    //     const classPrediction =
    //         prediction[i].className + ": " + prediction[i].probability.toFixed(2);
    //     labelContainer.childNodes[i].innerHTML = classPrediction;
    // }

}