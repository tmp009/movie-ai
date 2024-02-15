require('dotenv').config();

const { OpenAI } = require('openai');
const fs = require('fs/promises');
const { exit } = require('process');


const openai = new OpenAI();

if (process.argv.length < 4) {
    console.log(`node process.js <script> <output>`)
    exit(0)
} 

async function main(attempt) {
    const inputFile =  process.argv[2];
    const outFile =  process.argv[3];
    const data = await fs.readFile(inputFile, {encoding: 'utf-8'})
    
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
    const messages = [
        {role:'system', content: 'Convert the given movie script into json. Try to populate all fields in the json structure for each scene.'},
        {role:'system', content: 'Do not add any new json fields. Always include "elements" even if it has empty object. From "elements" remove any fields with a empty list or string.'},
        {role:'system', content: 'Pay close attention to cast members, background actors, stunts and other elements. Return valid JSON data.'},
        {role:'system', content: 'JSON structure: ' + JSON.stringify(jsonStruct)},
        {role:'user', content: data}
    ]
    
    const completion = await openai.chat.completions.create({
        messages: messages,
        model: 'gpt-4-1106-preview',
        response_format: {'type': 'json_object'},
        temperature: 0.35
    });

    const resp = completion.choices[0].message.content

    try {
        JSON.parse(resp);
    } catch (error) {
        if (attempt < process.env.OPENAI_RETRY) {
            console.error('Received invalid JSON data! Retrying...');
            main(attempt+1)
        } else {
            console.error('Failed to receive valid JSON data.')
            console.error(error.message)
            exit(1)
        }
    }

    await fs.writeFile(outFile, resp);
}

main(0);