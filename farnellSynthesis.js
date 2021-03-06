/*
 * Sedona Thomas snt2127, Rami Matar rhm2142, Carolyn Wang cw3136
 * farnellSynthesis.js: plays a sound like a babbling brook
 */

var audioCtx;

var lowpass1;
var freq1 = 400;

var lowpass2;
var freq2 = 14;
var lowpass2Mult = 400;
var lowpass2Add = 500 / 400;

var highpass;
var rq = 0.03;
var mul = 0.1;

const playButton = document.getElementById("play");
playButton.addEventListener('click', play, false);
function play(event) {
    if (!audioCtx) {
        audioCtx = initAudio();
        highpass = initHighpass();
        lowpass1 = initLowpass1(freq1, highpass);
        lowpass2 = initLowpass2(freq2, highpass);
        return;
    }
    else if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    else if (audioCtx.state === 'running') {
        audioCtx.suspend();
    }
}

function initAudio() {
    return new (window.AudioContext || window.webkitAudioContext)();
}

function initHighpass() {
    let high = audioCtx.createBiquadFilter();
    high.type = "highpass";
    high.frequency.setValueAtTime(0, audioCtx.currentTime);
    high.gain.setValueAtTime(0, audioCtx.currentTime);
    high.Q.value = 1 / rq;

    const gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(1, audioCtx.currentTime);

    high.connect(gainNode).connect(audioCtx.destination);
    return high;
}

function initLowpass1(freq, highpass) {
    let brown = makeBrownNoise();
    lowpass = audioCtx.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.setValueAtTime(freq, audioCtx.currentTime);
    lowpass.gain.setValueAtTime(0, audioCtx.currentTime);
    brown.connect(lowpass).connect(highpass);
    return lowpass;
}

function initLowpass2(freq, highpass) {
    let brown = makeBrownNoise();
    lowpass = audioCtx.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.setValueAtTime(freq, audioCtx.currentTime);
    lowpass.gain.setValueAtTime(0, audioCtx.currentTime);

    const gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(lowpass2Mult, audioCtx.currentTime);

    let constantSource = audioCtx.createConstantSource();
    constantSource.offset.value = lowpass2Add;

    brown.connect(lowpass).connect(gainNode);
    constantSource.connect(gainNode);
    constantSource.start();

    gainNode.connect(highpass.frequency);
    return lowpass;
}

function makeBrownNoise() {
    var bufferSize = 10 * audioCtx.sampleRate,
        noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate),
        output = noiseBuffer.getChannelData(0);

    var lastOut = 0;
    for (var i = 0; i < bufferSize; i++) {
        var brown = Math.random() * 2 - 1;
        output[i] = (lastOut + (0.02 * brown)) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5;
    }

    brownNoise = audioCtx.createBufferSource();
    brownNoise.buffer = noiseBuffer;
    brownNoise.loop = true;
    brownNoise.start(0);
    return brownNoise;
}
