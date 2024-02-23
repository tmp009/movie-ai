const robot = require("robotjs");
const { execSync } = require('child_process');

function copyToClipboard(text) {
    execSync(`echo ${text} | clip`, { windowsHide: true });
}


function writeText(text) {
    copyToClipboard(text)
    robot.keyToggle("control", "down");
    robot.keyTap("v");
    robot.keyToggle("control", "up");
}

function writeTextTab(text) {
    writeText(text)
    robot.keyTap('tab')
}

module.exports = { writeTextTab }