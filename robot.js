require('dotenv').config();

const fs = require('fs/promises');
const { exit } = require('process');

const RobotClient = require('./client')
const client = new RobotClient('http://0.0.0.0',3000);


if (process.argv.length < 3) {
    console.log(`node robot.js <script.json>`)
    exit(0)
}

async function main() {
    const inputFile =  process.argv[2];
    const data = await fs.readFile(inputFile, {encoding: 'utf-8'});
    let jsonData;

    try {
        jsonData = JSON.parse(data);
    } catch (error) {
        console.error('Failed to parse JSON data!');
        console.error(error.message);

        return
    }

    for (let i = 0; i < 5; i++) {
        console.log(5-i)
        await new Promise(r => setTimeout(r, 1000));
    }

    await client.setForeground();


    for (const scene of jsonData.scenes) {
        // row 1
        await client.writeTextTab(scene.scene_number)

        if (scene.set.type.length > 1)  { // INT/EXT
            await client.keyTap('down');
            await client.keyTap('down');
            await client.keyTap('down');
        } else if (scene.set.type[0].toUpperCase() == 'INT') {
            await client.keyTap('down');
        } else if (scene.set.type[0].toUpperCase() == 'EXT') {
            await client.keyTap('down');
            await client.keyTap('down');
        }

        await client.keyTap('tab');
        
        await client.writeTextTab(scene.set.description)
        
        switch (scene.time.toUpperCase()) {
            case 'DAY':
                await client.keyTap('down');
                break;

            
            case 'NIGHT':
                await client.keyTap('down');
                await client.keyTap('down');
                break;

            case 'MORNING':
                await client.keyTap('down');
                await client.keyTap('down');
                await client.keyTap('down');
                break;
            
            case 'EVENING':
                await client.keyTap('down');
                await client.keyTap('down');
                await client.keyTap('down');
                await client.keyTap('down');
                break;
        
            default:
                break;
        }

        await client.keyTap('tab');
        await client.keyTap('tab');
        await client.keyTap('tab');


        // row 2
        await client.writeTextTab(scene.synopsis)

        // row 3
        await client.keyTap('tab');
        await client.keyTap('tab');
        await client.keyTap('tab');
        await client.keyTap('tab');

        
        // row 4
        await client.writeTextTab(scene.location)
        await client.keyTap('tab');
        await client.keyTap('tab');
        await client.keyTap('tab');

        // escape elements field
        // await client.sendMultipleKeys(['right', 'down', 'tab'])
        await client.keyTap('right');
        await client.keyTap('down');
        await client.keyTap('tab');

        // Change scene
        await client.keyToggle("ctrl", true);
        await client.keyTap("right");
        await client.keyToggle("ctrl", false)

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
    }
}

main();