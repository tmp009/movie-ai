const { getAllWindows } = require('keysender')

function getWindow(name) {
    const window = getAllWindows().find((window)=>{
        return window.title.startsWith(name)
    })

    return window;
}

async function writeText(program, text) {
    await program.keyboard.printText(String(text))
    await new Promise(r => setTimeout(r, 100))
}

async function writeTextTab(program, text) {
    await writeText(program, text)
    await program.keyboard.sendKey('tab')
}

module.exports = { writeTextTab, writeText, getWindow }