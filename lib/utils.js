const { execSync } = require('child_process');
const { getAllWindows } = require('keysender')
const fs = require('fs/promises')

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

async function checkFileReadable(filePath) {
    try {
        await fs.access(filePath, fs.constants.R_OK); // Check if the file is readable
        return true;
    } catch (error) {
        if (error.code === 'EBUSY') {
            await new Promise((resolve) => setTimeout(resolve, 1500)); // Wait for 1 second before retrying (adjust as needed)
            return checkFileReadable(filePath);
        } else if (error.code === 'ENOENT') {
            return true;
        } else {
            throw error;
        }
    }
}

module.exports = { writeTextTab, writeText, getWindow, checkFileReadable }