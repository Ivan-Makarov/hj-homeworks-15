'use strict'

const photoControls = document.querySelector('.app .controls');
const takePhotoBtn = document.querySelector('#take-photo');
const errMsg = document.querySelector('#error-message');
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
const list = document.querySelector('.list');

const shutterClick = document.createElement('audio');
shutterClick.src = './audio/click.mp3'

navigator.mediaDevices
    .getUserMedia({
        video: true,
        audio: false
    })
    .then(stream => {
        const app = document.querySelector('.app');
        const video = document.createElement('video');
        app.appendChild(video);
        video.src = URL.createObjectURL(stream);

        photoControls.style.display = 'block';
        takePhoto(video);
    })
    .catch(err => {
        errMsg.style.display = 'block';
        errMsg.textContent = err;
    })

function takePhoto(video) {
    video.addEventListener('canplay', (evt) => {
        takePhotoBtn.addEventListener('click', () => {
            setTimeout(() => {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                ctx.drawImage(video, 0, 0);
                shutterClick.play();
                const image = canvas.toDataURL("image/png")

                const figure = document.createElement('figure');

                figure.innerHTML = `
                    <img src="${image}">
                    <figcaption>
                        <a href="${image}" download="snapshot.png">
                            <i class="material-icons">file_download</i>
                        </a>
                        <a>
                            <i class="material-icons">file_upload</i>
                        </a>
                        <a>
                            <i class="material-icons">delete</i>
                        </a>
                    </figcaption>
                `
                list.appendChild(figure)
                updateControls(figure, image);
            });
        });
    });
}

function updateControls(figure, image) {
    const controls = [...figure.querySelectorAll('a')];

    const down = controls[0];
    const up = controls[1];
    const del = controls[2];

    del.addEventListener('click', (e) => {
        list.removeChild(figure);
    });

    down.addEventListener('click', (e) => {
        hide(down);
    })

    up.addEventListener('click', (e) => {
        hide(up);
        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'https://neto-api.herokuapp.com/photo-booth');
        xhr.setRequestHeader("Content-Type","multipart/form-data");
        const formData = new FormData();
        formData.append('image', image);
        xhr.send(formData);
    })
}

function hide(btn) {
    btn.style.visibility = 'hidden';
}
