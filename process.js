require('dotenv').config();

const { OpenAI } = require('openai');
const fs = require('fs/promises');
const { exit } = require('process');

const maxRetries = process.env.OPENAI_RETRY;
const maxScenes = 4; // max number of scenes to send at once.
const openai = new OpenAI();
const responses = [];


if (process.argv.length < 4) {
    console.log(`node process.js <script> <output>`)
    exit(0)
} 

function splitScenes(data) {
    const scenes = [];
    let currentScene = { head: '', lines: [] };
    
    data.forEach((line, index) => {
        if (line.match(/(EXT\.|INT\.)/)) {
            if (currentScene.head != '') {
                scenes.push([currentScene.head, ...currentScene.lines].join('\n'))
            }
            currentScene = {
                head: line.trim(),
                lines: []
            }
        } else if (index == data.length-1) {
            scenes.push([currentScene.head, ...currentScene.lines].join('\n'))
        } else {
            currentScene.lines.push(line.trim())
        }

    })

    return scenes
}

async function callOpenAI(jsonStruct, scene) {
    const messages = [
        {role:'system', content: 'Convert the given movie script into json. Try to populate all fields in the json structure for each scene.'},
        {role:'system', content: 'Do not add any new json fields. Always include "elements" even if it has empty object. From "elements" remove any fields with a empty list or string.'},
        {role:'system', content: 'Pay close attention to cast members, background actors, stunts, actor\'s ages, and other elements. Ignore omitted scenes.'},
        {role:'system', content: 'JSON structure: ' + JSON.stringify(jsonStruct)},
        {role:'user', content: scene}
    ]

    const completion = await openai.chat.completions.create({
        messages: messages,
        model: 'gpt-4-1106-preview',
        response_format: {'type': 'json_object'},
        temperature: 0.35
    });

    return completion.choices[0].message.content
}

async function main() {
    const inputFile =  process.argv[2];
    const outFile =  process.argv[3];
    const data = (await fs.readFile(inputFile, {encoding: 'utf-8'})).split('\n');
    const scenes = splitScenes(data);
    
    let jsonData = { scenes: [] }

    
    const jsonStruct = {
        "scenes": [
            {
                "scene_number": "",
                "synopsis": "",
                "time": "Day",
                "location": "",
                "set": {
                    "type": ["INT", "EXT"],
                    "description": ""
                },
                "elements": {
                    "cast_members": [{"name": "", "age": ""}],
                    "background_actors": [{"name": "", "age": ""}],
                    "stunts": [""],
                    "vehicles": [""],
                    "props": [""],
                    "camera": [""],
                    "special_effects": [""],
                    "wardrobe": [""],
                    "makeup_or_hair": [""],
                    "animals": [""],
                    "music": [""],
                    "camera_lighting_notes": [""],
                    "sound": [""],
                    "set_dressing": [""],
                    "vfx": [""],
                    "mechanical_effects": [""],
                    "miscellaneous": [""],
                    "notes": [""],
                }
            }
        ]
    }
    
    for (let i = 0; i < scenes.length; i+=maxScenes) {
        const sceneChunk = scenes.slice(i, i+maxScenes).join('\n');

        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                const openaiResp = await callOpenAI(jsonStruct, sceneChunk);
                responses.push(openaiResp);
                break;
            } catch (error) {
                if (attempt+1 >= maxRetries) {
                    console.error("Failed to receive data from OpenAI!")
                    console.error("Error: " + error.message)
                    exit(1)
                } else {
                    console.error("Failed to receive data from OpenAI! Retrying...")
                }
            }
        }
    }

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            responses.forEach(resp => {
                const jsonResp = JSON.parse(resp);
                jsonData.scenes.push(...jsonResp.scenes)
            })
            break;
        } catch (error) {
            if (attempt+1 >= maxRetries) {
                console.error("Failed to receive valid JSON data.")
                console.error("Error: " + error.message)
                exit(1)
            } else {
                console.error("Received invalid JSON data! Retrying...")
            }
        }
    }

    await fs.writeFile(outFile, JSON.stringify(jsonData));
}

main();