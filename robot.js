require('dotenv').config();

const fs = require('fs/promises');
const { exit } = require('process');

const RobotClient = require('./lib/client');
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
    "additional_labor",
    "vfx",
    "mechanical_effects",
    "miscellaneous",
    "notes"
]


async function main() { 
    const inputFile =  process.argv[4];
    const data = await fs.readFile(inputFile, {encoding: 'utf-8'});
    const cache = {
        cast_members: [],
        background_actors: []
    }
    let jsonData;

    try {
        jsonData = JSON.parse(data);
    } catch (error) {
        console.error('Failed to parse JSON data!');
        console.error(error.message);

        return
    }

    // console.log("[info]: starting a empty project from template")
    // await client.restart();

    for (let i = 0; i < 5; i++) {
        console.log(`Starting: ${5-i}`)
        await new Promise(r => setTimeout(r, 1000));
    }

    await client.setForeground();
    await client.mouseMove(90, 204);
    await client.mouseClick('left')
    let f = []

    for (const [sceneIndex, scene] of jsonData.scenes.entries()) {
        console.info("[info]: starting scene " + scene.scene_number);

        // row 1
        await client.writeTextTab(scene.scene_number)


        if (scene.set.type.length > 1)  { // INT/EXT
            await client.sendMultipleKeys(['down', 'down', 'down'])
        } else if (scene.set.type[0].toUpperCase() == 'INT') {
            await client.keyTap('down');
        } else if (scene.set.type[0].toUpperCase() == 'EXT') {
            await client.sendMultipleKeys(['down', 'down'])
        }

        await client.keyTap('tab');
        
        await client.writeTextTab(scene.set.description)
        
        switch (scene.time.toUpperCase()) {
            case 'DAY':
                await client.keyTap('down');
                break;

            
            case 'NIGHT':
                await client.sendMultipleKeys(['down', 'down'])
                break;

            case 'MORNING':
                await client.sendMultipleKeys(['down', 'down', 'down'])
                break;
            
            case 'EVENING':
                await client.sendMultipleKeys(['down', 'down', 'down', 'down'])
                break;
        
            default:
                break;
        }

        await client.sendMultipleKeys(['tab', 'tab', 'tab'])
        

        // row 2
        await client.writeTextTab(scene.synopsis)

        // row 3
        await client.sendMultipleKeys(['tab', 'tab', 'tab', 'tab'])

        
        // row 4
        await client.writeTextTab(scene.location)
    
        // Elements
        for (const [index, element] of elementFields.entries()) {
            const targetElement  = scene?.elements[element];

    
            if (typeof targetElement === "undefined") {
                console.info("[info]: skipping field " + element);
                continue;
            }

            console.info("[info]: field", element, "with index", index, "has item count:", targetElement.length);
            
            await client.keyTap(['ctrl', 'e']); // open element creator
            
            await client.mouseMove(218, 155); // category button
            await client.mouseClick('left'); 
            await client.mouseMove(218, 162); // all category
            await client.mouseClick('left');

            await client.mouseMove(218, 155); // category button
            await client.mouseClick('left'); 

            switch (element) {
                case "cast_members":
                    await client.keyTap("cast".split(''));

                    break
                case "background_actors":
                    await client.keyTap("back".split(''));
                    break
                
                case "special_equipment":
                    await client.sendMultipleKeys("special".split('').concat(['space', 'e', 'q']))
                    break

                case "vfx":
                    await client.sendMultipleKeys("vis".split(''))
                    break
                default:
                    await client.keyTap(element.split('_')[0].split(''))
            }

            for (let value of targetElement) {
                let skipCreate = false;

                if (typeof value == 'string' && value == "") {
                    continue
                }
                console.info("[info]: inserting", value, "into", element);

                await client.mouseMove(236, 130); // element textbox
                await client.mouseClick('left', true); 
                await client.keyTap(['ctrl', 'a']);
                await client.keyTap(['ctrl', 'backspace']);

                if (element == 'cast_members' || element == 'background_actors') {

                    if (String(value?.age) != 'undefined' &&  String(value?.age).length > 0) {
                        value = `${value?.name} (${value?.age})`;
                        
                    } else {
                        value = `${value?.name}`
                    }

                    if (cache[element].includes(value)) {
                        skipCreate = true;
                    } else {
                        cache[element].push(value);
                    }
                }

                await client.writeText(value);

                if (!skipCreate) {
                    await client.mouseMove(502, 127); // new button
                    await client.mouseClick('left');
    
                    await new Promise(r => setTimeout(r, 200))
    
                    if ((await client.getProcess('Element Quick Entry')).process) {
                        await client.keyTap('enter')
    
                        await client.mouseMove(502, 158); // find button
                        await client.mouseClick('left');
    
                        await client.mouseMove(249, 264); // element
                        await client.mouseClick('left');
    
                        await client.mouseMove(499, 198); // insert element
                        await client.mouseClick('left');
                    }
                } else {
                    await client.mouseMove(502, 158); // find button
                    await client.mouseClick('left');

                    await client.mouseMove(249, 264); // element
                    await client.mouseClick('left');

                    await client.mouseMove(499, 198); // insert element
                    await client.mouseClick('left');
                }


                console.info("[info]: inserted", value, "into", element);

            }

            await client.mouseMove(501, 287); // close button
            await client.mouseClick('left'); 
        }

        // escape elements field
        console.info('[info]: starting new scene')
        await client.mouseMove(90, 204);
        await client.mouseClick('left')
        
        // Change scene
        await client.keyTap(["ctrl", "right"]);

        // save changes
        if (sceneIndex % 5 == 0) {
            await client.keyTap(["ctrl", "s"]);
            await new Promise(r => setTimeout(r, 2000))
        }

    }


    console.log('Finished automation')
}

main();