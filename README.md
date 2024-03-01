# movie-ai

## Compatiblity
* **Process.js** and **Robot.js** can be used on any platform,  **but the control server (controlServer.js) is only supported on Windows.**

## Requirements
* NodeJS (min. 18.14.0)
* Visual Studio 2019 Build Tools
* [OpenAI API key](https://platform.openai.com/api-keys) (for process.js)

## Install
```shell
> git clone https://github.com/tmp009/movie-ai
> cd movie-ai
> npm install
```

## Convert text file script to json format

### OpenAI API key must be in your environment or .env file
```shell
OPENAI_API_KEY="sk-xxxxxxxxx"
```

### Run process.js
```shell
node process.js script.txt output.json
```

## Run automation on Movie Magic Scheduling 6
### Start server on the target machine 
```shell
npm start
```
> If you're running this inside VirtualBox, disable `Input > Mouse Integration`. Otherwise mouse movement automation will not work.

### Run robot.js
```shell
node robot.js "0.0.0.0" 3000 output.json
```
> 0.0.0.0 targets the same machine that the server is running on.


## Environment variables
```shell
OPENAI_API_KEY="sk-xxxxxxxxx"
OPENAI_RETRY=4
PORT=3000
```