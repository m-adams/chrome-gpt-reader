'use strict';
import OpenAI from "openai";
import { Buffer } from "buffer";


async function transcribeThenAsk(audioBlob) {
  const apkKey = await new Promise((resolve) => {
    chrome.storage.sync.get("apiKey", (result) => {
      resolve(result.apiKey);
    });
  });
  if (!apkKey || apkKey === "") {
    throw new Error("API key is undefined or empty");
  }
  console.log("Converting audio blob to file");

  const openai = new OpenAI({apiKey: apkKey});
  var file= new File ([audioBlob], "audio.mp3", {type: "audio/mpeg"});
  const transcription = await openai.audio.transcriptions.create({
  file: file,
  model: "whisper-1",
  });

  const voiceQuestion= transcription.text;
  console.log("Transcription");
  console.log(transcription.text);
  processScreenshot(voiceQuestion);
}

async function callGpt(base64Image,question) {
  // Need to concatonate the base64 image with the message "data:image/jpeg;base64,{base64_image}"
  //const image_url = "data:image/jpeg;base64," + base64Image;
  const apkKey = await new Promise((resolve) => {
    chrome.storage.sync.get("apiKey", (result) => {
      resolve(result.apiKey);
    });
  });
  if (!apkKey || apkKey === "") {
    throw new Error("API key is undefined or empty");
  }
  const openai = new OpenAI({apiKey: apkKey});

  console.log("Calling chat GPT");
  console.log(question);
  const response = await openai.chat.completions.create({
    model: "gpt-4o-2024-05-13",
    messages: [
      {
        role: "system",
        content:[
          {
            type: "text",
            text: "You are a helpful assistant called Sam embedded in a web browser to act as an advanced type of screen reader to help people whol have issues seeing the web page. You can help by providing a short, simple description of the content of the page.",
          }
        ]
      },
      {
        role: "user",
        content: [
          { type: "text", text: question},
          {
            type: "image_url",
            image_url: {
              "url": base64Image,
            },
          },
        ],
      },
    ],
  });
  var responseText = response.choices[0].message.content;
  console.log(response);
  console.log(responseText);
  //const responseText = "This is a test";
  console.log("Calling audio GPT");
  const mp3 = await openai.audio.speech.create({
    model: "tts-1",
    voice: "alloy",
    input:  responseText,
  });

  // @ts-ignore
  const buffer = Buffer.from(await mp3.arrayBuffer());
  const blob = new Blob([buffer], { type: "audio/mpeg" });
  const reader = new FileReader();
  reader.readAsDataURL(blob);
  reader.onloadend = function() {
    const url = reader.result;
    // @ts-ignore
    console.log("Returning audio url");
    console.log(url);
    chrome.runtime.sendMessage({ 
      msg: "audio",
      data: {
         audioUrl: url
        } 
      });
  };


}

function dataUrlToBlob(dataUrl) {
  const base64 = dataUrl.split(',')[1];
  const byteString = atob(base64);
  const mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0];
  const arrayBuffer = new ArrayBuffer(byteString.length);
  const uint8Array = new Uint8Array(arrayBuffer);
  for (let i = 0; i < byteString.length; i++) {
    uint8Array[i] = byteString.charCodeAt(i);
  }
  return new Blob([arrayBuffer], { type: mimeString });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'READ') {
    var question = request.payload.message;
    processScreenshot(question);
    const message = "Let me try and help you with this page";
    console.log(message);
    sendResponse({ message: message});
  }
  else if (request.type === 'SPEAK') {
    console.log("Received audio");
    console.log(request);
    const audioUrl = request.payload.audio;
    console.log(audioUrl);
    const audioBlob = dataUrlToBlob(audioUrl);
    //const audioBlob = new Blob([audioUrl], { type: "audio/wav" });
    console.log(audioBlob);
    transcribeThenAsk(audioBlob);
    const message = "I have received the audio";
    console.log(message);
    sendResponse({ message: message});
  }

  
});
chrome.runtime.onInstalled.addListener((details) => {
  console.log(details)
  if (details.reason.search(/install/g) != -1) {
    chrome.tabs.create({
      url: chrome.runtime.getURL("Welcome.html"),
      active: true
  })
  }
  //  if (details.reason.search(/update/g) != -1) {
  //    chrome.tabs.create({
  //      url: chrome.runtime.getURL("Welcome.html"),
  //      active: true
  //  }
  // )
  // }
  return
})

chrome.commands.onCommand.addListener(function(command) {
  if (command === "describe_page") {
    processScreenshot("please describe the page");
  }
});

function processScreenshot(question) {
  return captureScreenshot(question,(base64Image) => {
    callGpt(base64Image, question);
  });
}

// ...

function captureScreenshot(question,callback) {
  chrome.tabs.captureVisibleTab(null, { format: 'png' }, (dataUrl) => {
    const base64Image = dataUrl//.replace('data:image/png;base64,', '');
    // Use the base64 encoded image as needed
    callback(base64Image);
  });} // Add closing parenthesis here
