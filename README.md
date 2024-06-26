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
## pdf2txt.js
Download Xpdf command line tools: https://www.xpdfreader.com/download.html

Extract **pdftotext** program into `bin/`

### Usage
```shell
Usage: pdf2txt.js [options] <pdf>

Options:
      --version  Show version number                                   [boolean]
  -o, --output   output filename for the text file.
                                                [string] [default: "output.txt"]
  -h, --help     Show help                                             [boolean]
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

### robot.js
```shell
> node .\robot.js -h

Usage: robot.js [options] <script>

Options:
      --version  Show version number                                   [boolean]
  -w, --win-10   Use windows 10 coordinates                            [boolean]
  -H, --host     the target machine running the control server.
                                                   [string] [default: "0.0.0.0"]
  -p, --port     the port the server is listening to.
                                             [number] [required] [default: 3000]
  -o, --output   the target machine running the control server.
                                                [string] [default: "output.msd"]
  -h, --help     Show help                                             [boolean]
```
> 0.0.0.0 targets the same machine that the server is running on.


## Environment variables
```shell
OPENAI_API_KEY="sk-xxxxxxxxx"
OPENAI_RETRY=4
PORT=3000
```