require('dotenv').config();

const { OpenAI } = require('openai');
const fs = require('fs/promises');
const { exit } = require('process');
const validator = require('./lib/validator');

const maxRetries = process.env.OPENAI_RETRY;
const maxScenes = 6; // max number of scenes to send at once.
const openai = new OpenAI();

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

async function scriptToMetadata(text) {
    const messages = [
        {role:'system', content: 'You are a movie script metadata generator. You will generate metedata for all scenes without failing. The user owns the rights to the script.'},
        {role:'system', content: 'metadata will include the ages of the actors and background actors. give scene range for when the age is valid i.e. Joe (age: 33, 1-9A; age 34, 10-30)'},
        {role:'system', content: 'do not ask if you can generate more. always generate for the entire script. ignore any limits unless the output is 4096 tokens long.'},
        {role:'user', content: text}
    ]

    const completion = await openai.chat.completions.create({
        messages: messages,
        model: 'gpt-4-1106-preview',
        temperature: 1
    });

    return completion.choices[0].message.content
}

async function scriptToJson(jsonStruct, metadata, scene) {
    const messages = [
        {role:'system', content: 'convert the given movie script into json. try to populate all fields in the json structure for each scene.'},
        {role:'system', content: 'do not add any new json fields. Always include "elements" even if it has empty object. From "elements" remove any fields with a empty list or string.'},
        {role:'system', content: 'pay close attention to cast members, background actors and never include non-actors into "cast_members" or "background_actors". Ignore omitted scenes.'},
        {role:'system', content: 'always separate actors with same name with numbers i.e Guard #1, Guard #2. unknown age must be "null" type. never repeat scenes if the output for it is already generated'},
        {role:'system', content: 'always look for and include all the props from the scene. never include "N/A" as item in elements'},
        {role:'system', content: 'automatically generate contents for "stunts", "notes" and "camera_lighting_notes" and always include scene_number, synopsis, time, location, set'},
        {role:'system', content: 'Metadata: ' + metadata},
        {role:'system', content: 'JSON structure: ' + JSON.stringify(jsonStruct)},
        {role:'user', content: scene}
    ]

    const completion = await openai.chat.completions.create({
        messages: messages,
        model: 'gpt-4-1106-preview',
        response_format: {'type': 'json_object'},
        temperature: 1
    });

    return completion.choices[0].message.content
}

async function main() {
    const inputFile =  process.argv[2];
    const outFile =  process.argv[3];
    const data = await fs.readFile(inputFile, {encoding: 'utf-8'})
    const scenes = splitScenes(data.split('\n')); 
    const jsonData = { metadata: "", scenes: [] } // all scenes will be stored here
    
    const jsonStruct = {
        "scenes": [
            {
                "scene_number": "",
                "synopsis": "",
                "time": "Always use one of these: Morning,Day,Evening,Night",
                "location": "",
                "set": {
                    "type": ["INT", "EXT"],
                    "description": ""
                },
                "elements": {
                    "cast_members": [{"name": "", "age": ""}],
                    "background_actors": [{"name": "", "age": ""}],
                    "stunts": ["performed stunts or major action by the actors"],
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

    // generate metadata
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            console.log('Generating metadata...');
            console.info('[metadata]: data.length =', data.length);
            jsonData.metadata = await scriptToMetadata(data);
            console.info("[metadata]:", jsonData.metadata)
            break
        } catch (error) {
            if (attempt+1 >= maxRetries) {
                console.error("Failed to receive script metadata from OpenAI!")
                console.error("Error: " + error.message)
                return 
            } else {
                console.error("Failed to receive script metadata from OpenAI! Retrying...")
            }
        }
    }

    // generate script to json
    for (let i = 0; i < scenes.length; i+=maxScenes) {
        const sceneChunk = scenes.slice(i, i+maxScenes).join('\n');
        
        
        for (let attempt = 0; attempt < maxRetries; attempt++) {
            let openaiResp;
            
            // convert script scenes into json
            try {
                console.log(`Converting script to JSON [${Math.ceil((i+1)/maxScenes)}/${ Math.ceil(scenes.length / maxScenes) }]...`);
                openaiResp = await scriptToJson(jsonStruct, jsonData.metadata, sceneChunk);
            } catch (error) {
                if (attempt+1 >= maxRetries) {
                    console.error("Failed to receive data from OpenAI!")
                    console.error("Error: " + error.message)
                    return 
                } else {
                    console.error("Failed to receive data from OpenAI! Retrying...")
                }
            }

            // parse json string and store all 
            // the scenes in a single object
            try {
                const jsonResp = JSON.parse(openaiResp);

                for (const scene of jsonResp.scenes) {
                    if (scene?.time.toLowerCase() == "continuous") {
                        scene.time = jsonData.scenes[jsonData.scenes.length-1].time
                    }
                    validator.sceneJson(scene)
                    jsonData.scenes.push(scene)
                }

                break
            } catch (error) {
                if (attempt+1 >= maxRetries) {
                    console.error("Failed to receive valid JSON data!")
                    console.error("Error: " + error.message)
                    return
                } else {
                    console.error("Failed to receive valid JSON data! Retrying...")
                }
            }
        }
    }
    await fs.writeFile(outFile, JSON.stringify(jsonData));
}

main();