require('dotenv').config();

const fs = require('fs/promises');
const { exit } = require('process');

if (process.argv.length < 3) {
    console.log(`node robot.js <script.json>`)
    exit(0)
} 

async function main() {
    const inputFile =  process.argv[2];
    const data = await fs.readFile(inputFile, {encoding: 'utf-8'});
    let jsonData;

    try {
        jsonData = JSON.parse(data)
    } catch (error) {
        console.error('Failed to parse JSON data!')
        console.error(error.message)
        exit(1);
    }

    jsonData.scenes.forEach(scene => {

        // row 1
        console.log(jsonData.scenes.length)
        console.log(scene.scene_number)
        console.log(scene.set.type.join('/'))
        console.log(scene.set.description)
        console.log(scene.time)

        // row 2
        console.log(scene.synopsis)

        // row 3
        

        // row 4
        console.log(scene.location)


        // Elements
        scene?.elements?.cast_members?.forEach(actor => console.log(actor.name, actor.age))

        scene?.elements?.background_actors?.forEach(actor => console.log(actor.name, actor.age))
        
        scene?.elements?.stunts?.forEach(stunt => console.log(stunt))

        scene?.elements?.vehicles?.forEach(vehicle => console.log(vehicle))

        scene?.elements?.props?.forEach(prop => console.log(prop))

        scene?.elements?.camera?.forEach(camera => console.log(camera))

        scene?.elements?.special_effects?.forEach(effect => console.log(effect))

        scene?.elements?.wardrobe?.forEach(wardrobe => console.log(wardrobe))

        scene?.elements?.makeup_or_hair?.forEach(item => console.log(item))

        scene?.elements?.animals?.forEach(animal => console.log(animal))

        scene?.elements?.music?.forEach(music => console.log(music))

        scene?.elements?.sound?.forEach(sound => console.log(sound))

        scene?.elements?.set_dressing?.forEach(dressing => console.log(dressing))

        scene?.elements?.vfx?.forEach(vfx => console.log(vfx))

        scene?.elements?.mechanical_effects?.forEach(effect => console.log(effect))

        scene?.elements?.miscellaneous?.forEach(misc => console.log(misc))

        scene?.elements?.notes?.forEach(note => console.log(note))
        
        console.log('')
    });
}


main();