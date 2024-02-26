const robot = require("robotjs");
const { execSync } = require('child_process');

async function copyToClipboard(text) {
    execSync(`echo ${text} | clip`, { windowsHide: true });
}


async function writeText(program, text) {
    await copyToClipboard(text)
    await program.keyboard.sendKey(["ctrl", "v"]);
}

async function writeTextTab(program, text) {
    await writeText(program, text)
    await program.keyboard.sendKey('tab')
}

const elementFields = [
    "cast_members",
    "background_actors",
    "stunts",
    "vehicles",
    "props",
    "camera",
    "special_effects",
    "wardrobe",
    "makeup_or_hair",
    "animals",
    "music",
    "sound",
    "set_dressing",
    "greenery",
    "special_equipment",
    "security",
    "additonal_labor",
    "vfx",
    "mechanical_effects",
    "miscellaneous",
    "notes"
]

module.exports = { writeTextTab, writeText, elementFields }