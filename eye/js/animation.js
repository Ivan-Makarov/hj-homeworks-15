function activateEye() {
    'use strict';

    const eye = document.querySelector('.big-book__pupil');
    const eyeX = eye.getBoundingClientRect().x;
    const eyeY = eye.getBoundingClientRect().y;
    const height = window.innerHeight;
    const width = window.innerWidth;

    const corners = [
        {
            x: 0,
            y: 0
        },
        {
            x: width,
            y: 0
        },
        {
            x: width,
            y: height
        },
        {
            x: 0,
            y: height
        }
    ]

    const maxDist = corners.reduce(toMaxDist, 0);

    function dist(aX, aY, bX, bY) {
        return Math.sqrt((aX - bX) * (aX - bX) + (aY - bY) * (aY - bY))
    }

    function toMaxDist(max, cur) {
        const distance = dist(cur.x, cur.y, eyeX, eyeY);
        if (distance > max) {
            return distance
        } else {
            return max
        }
    }

    document.addEventListener('mousemove', function(e) {
        const cursorRelCoord = {
            x: e.clientX - eyeX,
            y: e.clientY - eyeY
        }
        const cursorAngle = Math.atan(cursorRelCoord.y / cursorRelCoord.x);
        const cursorPolarCoord = {
            r: dist(eyeX, eyeY, e.clientX, e.clientY) / maxDist,
            t: cursorAngle
        }

        let pupilSize = 1;
        if (cursorPolarCoord.r * 3 < 3 && cursorPolarCoord.r * 3 > 1 ) {
            pupilSize = 1 / cursorPolarCoord.r
        } else if (cursorPolarCoord.r * 3 <= 1) {
            pupilSize = 3
        }

        const pupilX = cursorRelCoord.x > 0 ? 30 * cursorPolarCoord.r * Math.cos(cursorPolarCoord.t) : - (30 * cursorPolarCoord.r * Math.cos(cursorPolarCoord.t));
        const pupilY = cursorRelCoord.x > 0 ? 30 * cursorPolarCoord.r * Math.sin(cursorPolarCoord.t) : - (30 * cursorPolarCoord.r * Math.sin(cursorPolarCoord.t));

        eye.style.setProperty('--pupil-size', pupilSize);
        eye.style.setProperty('--pupil-x', pupilX + 'px');
        eye.style.setProperty('--pupil-y', pupilY + 'px');
    });
}

document.addEventListener('DOMContentLoaded', activateEye);
