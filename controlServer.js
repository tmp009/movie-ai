const { Hardware, getAllWindows } = require('keysender')
const utils = require('./utils')
const robot = require("robotjs");
const express = require('express');

const app = express();

const window = getAllWindows().find((window)=>{
    return window.title.startsWith('Movie Magic Scheduling 6')
})
const program = new Hardware(null, window.className)

app.use(express.json())

app.post('/set/foreground', (req,res)=>{
    console.log(program.workwindow.getView().x)
    program.workwindow.setForeground();
    res.json({status:200})
})

app.post('/mouse/:x/:y', (req,res) => {
    try {
        const xPos = req.params.x;
        const yPos = req.params.y;
    
        robot.moveMouse(xPos, yPos)
        res.json({status:200})
        
    } catch (error) {
        res.json({error:error.message})
    }
})

app.post('/keyboard/:key', async (req,res) => {
    try {
        const key = req.params.key;
    
        await program.keyboard.sendKey(key, 35, 50)
        res.json({status:200})
        
    } catch (error) {
        console.log(error)
        res.json({error:error.message})
    }
})

app.post('/keyboard/multiple', (req,res) => {
    try {
        const keys = req.params.keys;
    
        program.keyboard.sendKeys(keys)
        res.json({status:200})
        
    } catch (error) {
        console.log(error)
        res.json({error:error.message})
    }
})

app.post('/write', (req,res) => {
    try {
        const text = req.body.text;

        if (!text) {
            return res.status(400).json({error:'missing parameter "text"'})
        }
    
        utils.writeTextTab(text)
        
        res.json({status:200})
        
    } catch (error) {
        console.log(error)

        res.json({error:error.message})
    }
})

app.post('/toggle', (req,res) => {
    try {
        const key = req.body.key;
        const state = req.body.state;

        if (!key) {
            return res.status(400).json({error:'missing parameter "key"'})
        }

        if (!state) {
            return res.status(400).json({error:'missing parameter "state"'})
        }
    
        program.keyboard.toggleKey(key, state, 50);
        
        res.json({status:200})
        
    } catch (error) {
        console.log(error)

        res.json({error:error.message})
    }
})

app.listen(3000, '0.0.0.0', () => console.log('http://0.0.0.0:3000/'))