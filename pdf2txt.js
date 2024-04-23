const { promisify } = require('util')
const exec = promisify(require('child_process').exec)
const path = require('path')
const yargs = require('yargs');

const argv = yargs
    .options({
        'output':{
            alias: 'o',
            describe: 'output filename for the text file.',
            type: 'string',
            default: "output.txt",
        }
})
.showHelpOnFail(true, 'Error: Missing positional argument. Please provide a positional argument')
.demandCommand(1)
.usage('Usage: $0 [options] <pdf>')
.alias('h', 'help')
.argv;

const args = argv._;


class Pdf2Txt {
    constructor(filename) {
        this.binDir = path.join(__dirname, 'bin')
        this.filename = filename
    }

    async extract(start=0, end=null, outname='output.txt') {
        const opts = `-layout -enc "UTF-8" -f ${start} ${  typeof end == 'number' ? '-l ' + end : ''}`
        await exec(`${path.join(this.binDir, 'pdftotext')} ${opts} ${this.filename} ${outname}`);

    }
}


async function main() {
    const pdf = new Pdf2Txt(args[0])
    await pdf.extract(0, null, argv.output);

    console.log('Converted PDF to text file')
}

main()