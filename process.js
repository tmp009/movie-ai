require('dotenv').config();

const { OpenAI } = require('openai');
const fs = require('fs/promises');
const { exit } = require('process');


const openai = new OpenAI();

if (process.argv.length < 4) {
    console.log(`node process.js <script> <output>`)
    exit(0)
} 

async function main() {
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
                    "INT": false,
                    "EXT": false,
                    "description": ""
                },
                "elements": {
                    "cast_members": [{"name": "", "age": ""}],
                    "backgorund_actors": [{"name": "", "age": ""}],
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
        {role:'system', content: 'Do not add any new json fields. From "elements" remove any fields with a empty list or string.'},
        {role:'system', content: 'JSON structure: ' + JSON.stringify(jsonStruct)},
        {role:'user', content: data}
    ]
    
    const completion = await openai.chat.completions.create({
        messages: messages,
        model: 'gpt-4-1106-preview',
        response_format: {'type': 'json_object'}
    });

    await fs.writeFile(outFile, completion.choices[0].message.content);
}

main();