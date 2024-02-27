# movie-ai

## Convert text file script to json format

### OPENAI API key must be in your environment or .env file
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

### Run robot.js
```shell
node robot.js "0.0.0.0" 3000 output.json
```
> 0.0.0.0 targets the same machine that the server is running on.
