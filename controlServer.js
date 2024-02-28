require('dotenv').config();

const { Hardware, Virtual } = require('keysender');
const utils = require('./utils');
const express = require('express');
const { exec } = require('child_process');


const port = process.env.PORT || 3000;
const app = express();

const window = utils.getWindow('Movie Magic Scheduling 6');
let program;

try {
    program = new Hardware(null, window.className)
    program.workwindow.refresh();
} catch (error) {
    console.error("[Error] " + error.message)
    console.error("[*] Is Movie Magic Scheduling 6 running?")

    process.exit(1)
}

app.use(express.json())

app.post('/process', (req,res)=>{
    try {
        if (!req.body.name) {
            return res.status(400).json({error:'Missing parameter "name"'})
        }
        const wnd =  utils.getWindow(req.body.name)
        return res.json({process: wnd})
    } catch (error) {
        res.status(500).json({error:error.message})
    }
})

app.post('/dialog/acceptElements', async (req,res)=>{
    try {
        const wnd =  utils.getWindow('Unknown Element Name')
        if (wnd) {
            const handle = new Virtual(null,wnd.className);
            await handle.keyboard.sendKeys(['left', 'enter'])
        }
        res.json({status:200})

    } catch (error) {
        res.status(500).json({error:error.message})
    }
})


app.get('/stop', (req,res)=>{
    res.json({status:200})
    process.exit(0)
})

app.post('/restart', (req,res)=>{
    program.workwindow.close();
    exec('"C:\Program Files (x86)\Movie Magic\MM Scheduling\MM Scheduling.exe" "data\Default_Template.mst"')
    program.workwindow.refresh();
    res.json({status:200})
})

app.post('/set/foreground', (req,res)=>{
    program.workwindow.setForeground();
    res.json({status:200})
})

app.get('/mouse/coord', async (req,res) => {
    try {  
        const mousePos = program.mouse.getPos()
        res.json({x:mousePos.x, y:mousePos.y})
        
    } catch (error) {
        console.error(error)
        res.status(500).json({error:error.message})
    }
})

app.post('/mouse/move', async (req,res) => {
    try {
        const xPos = Number(req.body.x);
        const yPos = Number(req.body.y);

        if (!xPos) {
            return res.status(400).json({error:'Missing parameter "x"'})
        }

        if (!yPos) {
            return res.status(400).json({error:'Missing parameter "y"'})
        }

        await program.mouse.moveTo(xPos, yPos);
    
        res.json({status:200})
        
    } catch (error) {
        console.error(error)
        res.status(500).json({error:error.message})
    }
})

app.post('/mouse/click', async (req,res) => {
    try {
        const button = req.body.button;

        if (!button) {
            return res.json({error:'Missing parameter "button"'})
        }

        await program.mouse.click(button);
        
        res.json({status:200})
        
    } catch (error) {
        console.error(error)
        res.status(500).json({error:error.message})
    }
})

app.post('/keyboard/key', async (req,res) => {
    try {
        const key = req.body.key;

        if (!key) {
            return res.json({error:'Missing parameter "key"'})
        }
    
        await program.keyboard.sendKey(key)
        res.json({status:200})
        
    } catch (error) {
        console.log(error)
        res.status(500).json({error:error.message})
    }
})

app.post('/keyboard/multiple', async (req,res) => {
    try {
        const keys = req.params.keys;
        
        if (!keys) {
            return res.status(400).json({error:'missing parameter "keys"'})
        }
    
        await program.keyboard.sendKeys(keys)
        res.json({status:200})
        
    } catch (error) {
        console.log(error)
        res.status(500).json({error:error.message})
    }
})

app.post('/write', async (req,res) => {
    try {
        const text = req.body.text;
        const tab = req.body.tab;

        if (!text) {
            return res.status(400).json({error:'missing parameter "text"'})
        }
    
        if (tab) {
            await utils.writeTextTab(program, text)
        } else {
            await utils.writeText(program, text)
        }
        
        res.json({status:200})
        
    } catch (error) {
        console.log(error)

        res.status(500).json({error:error.message})
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
        
        res.status(500).json({status:200})
        
    } catch (error) {
        console.log(error)

        res.status(500).status(500).json({error:error.message})
    }
})

app.listen(port, '0.0.0.0', () => console.log(`http://0.0.0.0:${port}/`))