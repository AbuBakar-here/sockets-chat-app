# Sockets Chat App

Simple chat app created with Node.js, Socket.io and Express.

## Table of Contents

* [Technologies](#technologies)
* [Installation](#installation)
* [Demo](#demo)
* [Fixes](#fixes)
* [License](#license)

## Technologies

* Node.js
* Socket.io
* Express

All information regarding required libraries can be found in `package.json` file.


## Installation

You might require the following:
- Node.js version => 17.3.0
- Npm version => 8.3.0

After this everything else is straight-forward.

```bash
git clone https://github.com/AbuBakar-here/sockets-chat-app
cd sockets-chat-app
npm install
npm run start
```

This will start the applications on host: `localhost` and port: `3000`.

**For developers**, just add a `--dev` flag while installing dependencies and use `npm run dev` to start server with **nodemon**.

```bash
npm install --dev
npm run dev
```

## Demo

[**Sockets Chat App**](
https://abubakar-sockets-chat-app.herokuapp.com/), this will take you to a heroku app where this app is hosted.

## Fixes

* **Fix 1.0**: Fixed a bug, when sender is not typing, it shows everyone else the that sender is typing.


## License
> You can check out the full license [here](https://github.com/AbuBakar-here/sockets-chat-app/blob/main/LICENSE)

This project is licensed under the terms of the **MIT** license.
