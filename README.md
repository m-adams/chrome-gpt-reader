# <img src="public/icons/icon_48.png" width="45" align="left"> Gpt Screen Reader

This extension was written as a small experiment in the possibility of using LLMs to help with accesibility.

LLMs are terrible at facts but great at interacting with people. Tradisional screen readers are extremely simplistic, slow and can't provide context to the user.

I wass inspired by the work of OpenAI on ChatGPT 4o and their inclusion in to Be My Eyes.
https://openai.com/index/be-my-eyes/

What if you could have a conversation with a website?

Only one way to find out!

Ohh and of course, please do not fully rely on the answers provided and expect some rough endges.

## Features

- Describe a web page using image analysis of the web page
- Ask a specific question about the site in text. It doesn't have to be something included in the general description
- Record a short audio clip of you asking a question about the page

## Install

To power the extension you need an OpenAI API Key.

[OpenAI Platform](https://platform.openai.com/)

Create an account, add some limited funding and generate a key.
All initial development and testing of the extension cost $0.50

I would however reccomend turning off auto-topup and enforcing spending limits just to make sure.

As this is still in development, clone this repo and see the quickstart guide.

[Quickstart Guide](quickstart.md)

## Contribution

Suggestions and pull requests are welcome!

I'm not a JavaScript developer, I've developed this purely as a proof of concept. 

Here's a list of potential enhancements and features to consider:
- Addition of more keyboard shortcuts.
- Capability to record while a keyboard shortcut is being held down.
- Use of content scripts and functions to allow the Language Learning Model (LLM) to interact with the site.
- Provision of a structured approach around a user goal and chat history.

---

This project was bootstrapped with [Chrome Extension CLI](https://github.com/dutiyesh/chrome-extension-cli).

---

This project was bootstrapped with [Chrome Extension CLI](https://github.com/dutiyesh/chrome-extension-cli)


Significiant portions of this code were constructed with the help of Github Copilot 

