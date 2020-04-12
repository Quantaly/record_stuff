import Vue from "https://cdn.jsdelivr.net/npm/vue@2.6.11/dist/vue.esm.browser.min.js";
import MediaStreamFusion from "./media_stream_fusion.js";

const outputFusion = new MediaStreamFusion();

const mediaRecorder = new MediaRecorder(outputFusion.output, { mimeType: "video/webm" });
let recordedChunks = [];

let currentAudioSelection = 0n;
let currentVideoSelection = 0n;

const vm = new Vue({
    el: "#vue",
    data: {
        audioInputAvailable: false,
        videoInputAvailable: false,
        recording: false,
        outputSrc: null,
    },
    methods: {
        selectAudio: async function (event) {
            const id = ++currentAudioSelection;
            outputFusion.audio = new MediaStream();
            switch (event.target.value) {
                case "none":
                    break;
                case "mic":
                    try {
                        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                        if (currentAudioSelection === id) {
                            outputFusion.audio = stream;
                        }
                    } catch (e) {
                        event.target.value = "none";
                    }
                    break;
            }
        },
        selectVideo: async function (event) {
            const id = ++currentVideoSelection;
            outputFusion.video = new MediaStream();
            switch (event.target.value) {
                case "none":
                    break;
                case "cam":
                    try {
                        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                        if (currentVideoSelection === id) {
                            outputFusion.video = stream;
                        }
                    } catch (e) {
                        event.target.value = "none";
                    }
                    break;
                case "screen":
                    try {
                        const stream = await navigator.mediaDevices.getDisplayMedia();
                        if (currentVideoSelection === id) {
                            outputFusion.video = stream;
                        }
                    } catch (e) {
                        console.error(e);
                        event.target.value = "none";
                    }
                    break;
            }
        },
        startRecording: function () {
            this.recording = true;
            mediaRecorder.start();
        },
        stopRecording: function () {
            this.recording = false;
            mediaRecorder.stop();
        },
    },
});

const video = document.querySelector("#preview");
video.addEventListener("loadedmetadata", _ => {
    video.play();
});
window.addEventListener("load", _ => {
    video.srcObject = outputFusion.videoOutput;
});

mediaRecorder.addEventListener("start", _ => {
    recordedChunks = [];
});

mediaRecorder.addEventListener("dataavailable", e => {
    recordedChunks.push(e.data);
});

mediaRecorder.addEventListener("stop", _ => {
    const blob = new Blob(recordedChunks, { type: mediaRecorder.mimeType });
    recordedChunks = [];
    vm.outputSrc = URL.createObjectURL(blob);
});

async function checkAvailability() {
    const devices = await navigator.mediaDevices.enumerateDevices();
    let [audioInputAvailable, videoInputAvailable] = [false, false];
    devices.forEach(device => {
        switch (device.kind) {
            case "audioinput":
                audioInputAvailable = true;
                break;
            case "videoinput":
                videoInputAvailable = true;
                break;
        }
    });
    vm.audioInputAvailable = audioInputAvailable;
    vm.videoInputAvailable = videoInputAvailable;
}

navigator.mediaDevices.addEventListener("devicechange", checkAvailability);
checkAvailability();