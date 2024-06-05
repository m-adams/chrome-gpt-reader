'use strict';

import './popup.css';

(function() {
  function playGreeting() {
    var greeting = new Audio(chrome.runtime.getURL("greeting.mp3"));
    greeting.play();
  }


  // We want the greeting to play only once unless the user requests it
  chrome.storage.sync.get('firstRun', (data) => {
    if (data.firstRun === undefined || data.firstRun) {
      playGreeting();
      chrome.storage.sync.set({ firstRun: false });
    }
    else {
      chrome.storage.sync.get('playGreeting', (data) => {
        if (data.playGreeting) {
          playGreeting();
        } else {
          var hi = new Audio(chrome.runtime.getURL("hi.mp3"));
          hi.play();
        }
      }
      );
    }
  });

  function handlePlayGreetingClick() {
    playGreeting();
  }

  document.getElementById('play-greeting-button').addEventListener('click', handlePlayGreetingClick);

  console.log("popup.js");

  var please_wait =new Audio(chrome.runtime.getURL("wait.mp3"));// new Audio('/public/greeting.mp3');

  // Listen for messages from the background script
  // The audio response will be returned so we can play it
  chrome.runtime.onMessage.addListener(function(request) {
    if (request.msg === "audio") {
      console.log("Audio received");
      console.log(request.data.audioUrl);
      var audio = new Audio(request.data.audioUrl);
      audio.play();
    }
  });

  function checkApiKey() {
    // We want to validate the api key is set to something and if not, tell the user what to do
    // This could be extended to do error handling or validation that the key works
    let apiKey;
    chrome.storage.sync.get('apiKey', (data) => {
      console.log('API key:', data.apiKey);
      apiKey = data.apiKey;
      if (apiKey !== undefined && apiKey !== ''){
        handleClick();
      }else {
          console.log('No API key');
          var noKey = new Audio(chrome.runtime.getURL("no_key.mp3"));
          noKey.play();
        }
    });
    
  }
let askButton = document.getElementById('ask-button');
let chunks = [];
let mediaRecorder;

// Get audio stream from user's microphone
// Record audio and send it to the background script
// The background script will send it to the OpenAI API
// TODO: Add error handling
// TODO: set a max recording time somehow
navigator.mediaDevices.getUserMedia({ audio: true })
  .then(stream => {
    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = function(e) {
      chunks.push(e.data);
    };

    mediaRecorder.onstop = function(e) {
      
      let blob = new Blob(chunks, { 'type' : 'audio/wav' });
      console.log("Recorded audio from a user question")
      console.log(blob);
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = function() {
        const url = reader.result
        // Uncomment this if you want to test audio was recorded for debugging
        //const audio = new Audio(url);
        //audio.play();
        chrome.runtime.sendMessage(
          {
            type: 'SPEAK',
            payload: {
              audio: url,
            },
          },
          () => {
            console.log("Success");
          }
        );
      }
      
      //  

    };
  });

 askButton.onclick = function() {
   if (mediaRecorder.state === 'recording') {
     console.log("Stopping recording");
     mediaRecorder.stop();
     askButton.textContent = 'Speak a Question';
  } else {
    console.log("Starting recording");
    mediaRecorder.start();
    askButton.textContent = 'Stop Recording';
  }
};

  // Handle the button click for describe page
  function handleClick() {
    // Get the question from the input field
    var question = document.getElementById('question-input').value;
    if (question.trim() === '') {
      // If the question is empty, we will ask a generic question
      question = "I'm using a website and I can't see well, please help me by giving me a short, simple description of the content of the page" ;
    }
    console.log('Question:', question);
    please_wait.play();

    chrome.runtime.sendMessage(
      {
        type: 'READ',
        payload: {
          message: question,
        },
      },
      () => {
        console.log("Success");
      }
    );
  }

  document.getElementById('read-button').addEventListener('click', checkApiKey);
})();
