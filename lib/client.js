module.exports = class RobotClient {
    constructor(url, port) {
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'http://' + url;
        }
        this.host = url + ':' + port;
    }

    async post(route, body, delay=0) {
        const resp = await fetch(this.host+route, {
            method:"POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        })

        if (!resp.ok) {
            throw new Error(`Server returned status ${resp.status} with content: ${await resp.text()}`);
        }

        if (delay){
            await new Promise(r => setTimeout(r, delay));
        }

        return resp
    }

    async get(route) {
        const resp = await fetch(this.host+route, {
            method:"GET",
            headers: {
                'Content-Type': 'application/json'
            }
        })

        if (!resp.ok) {
            throw new Error(`Server returned status ${resp.status} with content: ${await resp.text()}`);
        }

        return resp
    }

    async restart() {
        await this.post('/restart',{})
    }

    async getProcess(name) {
        return await (await this.post('/process', {name})).json();
    }

    async retrieve() {
        return await this.get('/retrieve');
    }

    async handleElementDialog() {
        await this.post('/dialog/acceptElements',{})
    }

    async mouseMove(x, y) {
        await this.post('/mouse/move', {
            x,
            y
        }, 200);
    }

    async mouseClick(button, double=false) {
        await this.post('/mouse/click', {button, double}, 100);
    }

    async keyTap(key) {
        await this.post('/keyboard/key', {key:key});
    }

    async sendMultipleKeys(keys) {
        await this.post('/keyboard/multiple', {keys:keys});
    }

    async writeTextTab(text) {
        await this.post('/write', {
            text:text, tab:true
        });
    }

    async writeText(text) {
        await this.post('/write', {
            text:text
        });
    }

    async keyToggle(key, state) {
        await this.post('/toggle', {
            key:key,
            state:state
        });
    }

    async setForeground(){
        await this.post('/set/foreground', {});
    }
}