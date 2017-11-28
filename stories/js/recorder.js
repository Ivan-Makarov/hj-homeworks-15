'use strict';

if (navigator.mediaDevices === undefined) {
    navigator.mediaDevices = {};
}

if (navigator.mediaDevices.getUserMedia === undefined) {
    navigator.mediaDevices.getUserMedia = function(constraints) {
        var getUserMedia = navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia ||
            navigator.msGetUserMedia;

        if (!getUserMedia) {
            return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
        }
        return new Promise((resolve, reject) => {
            getUserMedia.call(navigator, constraints, resolve, reject);
        });
    }
}

function createThumbnail(video) {
    return new Promise((done, fail) => {
        const preview = document.createElement('video');
        preview.src = URL.createObjectURL(video);
        preview.addEventListener('loadeddata', () => preview.currentTime = 2);
        preview.addEventListener('seeked', () => {
            const snapshot = document.createElement('canvas');
            const context = snapshot.getContext('2d');
            snapshot.width = preview.videoWidth;
            snapshot.height = preview.videoHeight;
            context.drawImage(preview, 0, 0);
            snapshot.toBlob(done);
        });
    });
}

function record(app) {
    return new Promise((done, fail) => {
        app.mode = 'preparing';
        navigator.mediaDevices.getUserMedia(app.config)
            .then((stream) => {
                app.mode = 'preparing';
                app.preview.src = URL.createObjectURL(stream);
                const recorder = new MediaRecorder(stream);
                app.preview.src = URL.createObjectURL(stream);
                let chunks = [];
                recorder.addEventListener('dataavailable', (e) => chunks.push(e.data));
                recorder.addEventListener('stop', (e) => {
                    const recorded = new Blob(chunks, {
                        'type': recorder.mimeType
                    });
                    const thumbnail = createThumbnail(recorded);
                    const result = {
                        video: recorded,
                        frame: thumbnail
                    }
                    done(result)
                });
                setTimeout(() => {
                    app.mode = 'recording';
                    recorder.start();
                    setTimeout(function() {
                        recorder.stop();
                        app.mode = 'sending';
                        app.preview.src = null;
                        stream.getTracks().forEach(track => track.stop())
                    }, app.limit);
                }, 1000);
        })
    });
}
