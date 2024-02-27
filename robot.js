require('dotenv').config();

const fs = require('fs/promises');
const { exit } = require('process');

const RobotClient = require('./client');
if (process.argv.length < 5) {
    console.log(`Usage: node robot.js <hostname> <port> <script.json>`)
    console.log('Make sure Movie Magic Scheduling 6 is open with Default_Template.mst on the target machine.')
    exit(0)
}

const hostname = process.argv[2];
const port = process.argv[3];
const client = new RobotClient(hostname,port);

async function main() { 
    const inputFile =  process.argv[4];
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
        console.log(`Starting: ${5-i}`)
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
        await client.keyTap('right');
        await client.keyTap('down');
        await client.keyTap('tab');

        // Change scene
        await client.keyTap(["ctrl", "right"]);
    }

    console.log('Finished automation')
}

main();