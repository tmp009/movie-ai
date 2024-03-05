const assert = require('assert')

const sceneFields = [
    "scene_number",
    "synopsis",
    "time",
    "location",
    "set"
]

// const time = ["morning","day","evening","night"];

function sceneJson(data) {
    for (const field of sceneFields) {
        try {
            assert.ok(data.hasOwnProperty(field));
        } catch {
            throw new Error(`Received malformed script data with missing field: ${field}`)
        }

        try {
            assert.ok(data[field] != "");
        } catch {
            throw new Error(`Received malformed script data with empty string field: ${field}`)
        }
    }

    try {
        assert.ok(data.set.type, 'missing set type');       
        assert.ok(data.set.description, 'missing set description');
    } catch (error) {
        throw new Error(`Received malformed script data with scene: ${error.message}`)
    }

    // try {
    //     assert.ok(time.includes(data.time.toLowerCase()));       
    // } catch {
    //     throw new Error(`Received malformed script data with scene: ${data.time} is not a valid time`)
    // }
}

module.exports = {sceneJson}