'use strict';

import './welcome.css';

(function() {
console.log("Welcome to the extension!");

const audio = new Audio('welcome.mp3');
audio.play();

navigator.mediaDevices.getUserMedia({ audio: true })
 .then(stream => {return})
 .catch(err => {return})
})();