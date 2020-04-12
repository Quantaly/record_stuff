export default class StreamFusion {
    constructor() {
        this.output = new MediaStream();
        this.videoOutput = new MediaStream();
        this.audioOutput = new MediaStream();
        Object.freeze(this);
    }

    /**
     * @param {MediaStream} stream
     */
    set audio(stream) {
        if (stream instanceof MediaStream) {
            this.audioOutput.getTracks().forEach(track => {
                this.output.removeTrack(track);
                this.audioOutput.removeTrack(track);
                track.stop();
            });
            stream.getAudioTracks().forEach(track => {
                this.output.addTrack(track);
                this.audioOutput.addTrack(track);
            });
        }
    }

    /**
     * @param {MediaStream} stream
     */
    set video(stream) {
        if (stream instanceof MediaStream) {
            this.videoOutput.getTracks().forEach(track => {
                this.output.removeTrack(track);
                this.videoOutput.removeTrack(track);
                track.stop();
            });
            stream.getVideoTracks().forEach(track => {
                this.output.addTrack(track);
                this.videoOutput.addTrack(track);
            });
        }
    }
}
