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
    await client.mouseMove(90, 204);
    await client.mouseClick('left')

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

        const  xBase  = 39;
        const  yBase  = 385;

        // adding items affect allignment 
        let xExt = 0; 
        let yExt = 0; 
        let overflow = 0
    
        // Elements
        for (const [index, element] of elementFields.entries()) {
            const targetElement  = scene?.elements[element];
    
            if (typeof targetElement === "undefined") {
                console.info("[info]: skipping field " + element);
                continue;
            }

            console.info("[info]: field " + element + " has " + targetElement.length + " items");
    
            for (const value of targetElement) {
                const xCoord = xBase + xExt;
                const yCoord = yBase + 16.2 * (index - overflow)  + (16.2 * yExt); // take added items into account

                await client.mouseMove(xCoord, yCoord);
                await client.mouseClick('left'); 
                
                switch (element) {
                    case "cast_members":
                    case "background_actors":
                        if (value?.age != '' || typeof value?.age != 'undefined' ) {
                            await client.writeText(`${value?.name} (${value?.age})`);
                        } else {
                            await client.writeText(`${value?.name}`)
                        }
                        break;
                
                    default:
                        await client.writeText(value)
                        break;
                }
                await client.keyTap('enter');

                // const addDialog = await client.getProcess('Unknown Element Name');

                // if (addDialog.process) {
                //     console.info('[info]: handling dialog')
                //     await new Promise(r => setTimeout(r, 500))
                //     await client.keyTap('enter');      
                // }

                await client.handleElementDialog();
            }
            yExt += targetElement.length;

            if (yExt > 759) { // handle overflow
                console.info('[info]: resetting yExt and increasing xExt')
                xExt += 200;
                yExt = 0;
                overflow = index;
            }
        }

        // reset values for next scene
        console.info('[info]: resetting x,y ext')
        xExt = 0; 
        yExt = 0; 

        // escape elements field
        console.info('[info]: starting new scene')
        await client.mouseMove(90, 204);
        await client.mouseClick('left')
        
        // Change scene
        await client.keyTap(["ctrl", "right"]);
    }


    console.log('Finished automation')
}

main();