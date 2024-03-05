const { execSync } = require('child_process');
const { getAllWindows } = require('keysender')

async function copyToClipboard(text) {
    execSync(`echo|set /p=${text}| clip`, { windowsHide: true });
}

function getWindow(name) {
    const window = getAllWindows().find((window)=>{
        return window.title.startsWith(name)
    })

    return window;
}

async function writeText(program, text) {
    await copyToClipboard(text)
    await program.keyboard.sendKey(["ctrl", "v"]);
}

async function writeTextTab(program, text) {
    await writeText(program, text)
    await program.keyboard.sendKey('tab')
}

module.exports = { writeTextTab, writeText, getWindow }