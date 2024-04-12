require('dotenv').config();

const fs = require('fs/promises');
const RobotClient = require('./lib/client');

const yargs = require('yargs');

// Define the command-line options
const argv = yargs
    .options({
        'win-10': {
            alias: 'w',
            describe: 'Use windows 10 coordinates',
            type: "boolean"
        },
        'host': {
            alias: 'H',
            describe: 'the target machine running the control server.',
            type: 'string',
            default: "0.0.0.0",
        },
        'port': {
            alias: 'p',
            describe: 'the port the server is listening to.',
            type: 'number',
            default: 3000,
            demandOption: true
        },
        'output': {
            alias: 'o',
            describe: 'the target machine running the control server.',
            type: 'string',
            default: "output.msd",
        }
})
.showHelpOnFail(true, 'Error: Missing positional argument. Please provide a positional argument.\nMake sure Movie Magic Scheduling 6 is open with Default_Template.mst on the target machine.\n')
.demandCommand(1)
.usage('Usage: $0 [options] <script>')
.alias('h', 'help')
.check((argv) => {
    if (isNaN(argv.port)) {
        throw new Error('Error: Invalid value for "port". Please provide a valid number.');
    }
    return true;
})
.argv;

const args = argv._;

const hostname = argv.host;
const port = argv.port;
const output = argv.output;
const client = new RobotClient(hostname,port);

let elementBox;
let parentWindow;

if (argv['win-10']) {
    const elementsCoord = require('./elements_win10.json');
    elementBox=elementsCoord.elementBox;
    parentWindow=elementsCoord.parentWindow;
} else {
    const elementsCoord = require('./elements.json');
    elementBox=elementsCoord.elementBox;
    parentWindow=elementsCoord.parentWindow;
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
    "art_department",
    "animals",
    "animal_wrangler",
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
    const inputFile =  args[0];
    const data = await fs.readFile(inputFile, {encoding: 'utf-8'});
    const cache = { cast_members: [], background_actors: [] } // avoid trying to recreate the elements
    let jsonData;

    try {
        jsonData = JSON.parse(data);
        console.log('[info]: the script has', jsonData.scenes.length, "scenes.")
    } catch (error) {
        console.error('Failed to parse JSON data!');
        console.error(error.message);

        return
    }

    console.log("[info]: starting a empty project from template")
    await client.restart();

    for (let i = 0; i < 5; i++) {
        console.log(`Starting: ${5-i}`)
        await client.setForeground();
        await new Promise(r => setTimeout(r, 1000));
    }

    await client.mouseMove(parentWindow.sceneNumber.x, parentWindow.sceneNumber.y); // scene number textbox
    await client.mouseClick('left')

    for (const [sceneIndex, scene] of jsonData.scenes.entries()) {
        console.info("[info]: starting scene " + scene.scene_number);

        // row 1
        await client.writeTextTab(scene.scene_number)


        if (scene?.set?.type?.length > 1)  { // INT/EXT
            await client.sendMultipleKeys(['down', 'down', 'down'])
        } else if (scene?.set?.type[0]?.toUpperCase() == 'INT') {
            await client.keyTap('down');
        } else if (scene?.set?.type[0]?.toUpperCase() == 'EXT') {
            await client.sendMultipleKeys(['down', 'down'])
        }

        await client.keyTap('tab');

        await client.writeTextTab(scene.location.toUpperCase())

        switch (scene?.time?.toUpperCase()) {
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
        await client.keyTap('tab')

        if (scene?.time?.toUpperCase() == 'NIGHT') {
            await client.writeTextTab('N' + scene.current_day)
        } else {
            await client.writeTextTab('D' + scene.current_day)
        }
        await client.sendMultipleKeys(['tab', 'tab'])


        // row 4
        await client.writeTextTab(scene.location.toUpperCase())

        // Elements
        for (const [index, element] of elementFields.entries()) {
            const targetElement  = scene?.elements[element];

            if (typeof targetElement === "undefined" || targetElement.length <= 0) {
                console.info("[info]: skipping field " + element);
                continue;
            }

            console.info("[info]: field", element, "with index", index, "has item count:", targetElement.length);

            await client.keyTap(['ctrl', 'e']); // open element creator

            await client.mouseMove(elementBox.category.x, elementBox.category.y); // category button
            await client.mouseClick('left');
            await client.mouseMove(elementBox.categoryTop.x, elementBox.categoryTop.y); // all category
            await client.mouseClick('left');

            await client.mouseMove(elementBox.category.x, elementBox.category.y); // category button
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

                case "security":
                    await client.sendMultipleKeys("sec".split(''))

                case "animal_wrangler":
                    await client.sendMultipleKeys("animal".split('').concat(['space', 'w']))

                default:
                    await client.keyTap(element.split('_')[0].split(''))
            }

            for (let value of targetElement) {
                let skipCreate = false;

                if (typeof value == 'string' && value == "") {
                    continue
                }
                console.info("[info]: inserting", value, "into", element);

                await client.mouseMove(elementBox.element.x, elementBox.element.y); // element textbox
                await client.mouseClick('left', true);
                await client.keyTap(['ctrl', 'a']);
                await client.keyTap(['ctrl', 'backspace']);

                if (element == 'cast_members' || element == 'background_actors') {

                    if (!['undefined', 'null'].includes(String(value?.age)) &&  String(value?.age).length > 0) {
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
                    await client.mouseMove(elementBox.new.x, elementBox.new.y); // new button
                    await client.mouseClick('left');

                    await new Promise(r => setTimeout(r, 200))

                    if ((await client.getProcess('Element Quick Entry')).process) {
                        await client.keyTap('enter')

                        await client.mouseMove(elementBox.find.x, elementBox.find.y); // find button
                        await client.mouseClick('left');

                        await client.mouseMove(elementBox.item.x, elementBox.item.y); // element
                        await client.mouseClick('left');

                        await client.mouseMove(elementBox.insert.x, elementBox.insert.y); // insert element
                        await client.mouseClick('left');
                    }
                } else {
                    await client.mouseMove(elementBox.find.x, elementBox.find.y); // find button
                    await client.mouseClick('left');

                    await client.mouseMove(elementBox.item.x, elementBox.item.y); // element
                    await client.mouseClick('left');

                    await client.mouseMove(elementBox.insert.x, elementBox.insert.y); // insert element
                    await client.mouseClick('left');
                }


                console.info("[info]: inserted", value, "into", element);

            }

            await client.mouseMove(elementBox.close.x, elementBox.close.y); // close button
            await client.mouseClick('left');
        }

        // escape elements field
        console.info('[info]: starting new scene')
        await client.mouseMove(parentWindow.sceneNumber.x, parentWindow.sceneNumber.y);
        await client.mouseClick('left')

        // Change scene
        await client.keyTap(["ctrl", "right"]);

        // save changes
        if (sceneIndex % 5 == 0) {
            await client.keyTap(["ctrl", "s"]);
            await new Promise(r => setTimeout(r, 2500))
        }

    }

    await client.keyTap(["ctrl", "s"]);
    await new Promise(r => setTimeout(r, 2500))

    console.log('Saving file to', output)

    const file = await client.retrieve();
    const fileblob = await file.blob();

    await fs.writeFile(output, Buffer.from(await fileblob.arrayBuffer()), {'encoding':'binary'});

    console.log('Finished automation!')
}

main();