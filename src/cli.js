import fs from 'fs'
import minimist from 'minimist'

import packageJSON from '../package.json'
import JSON5 from './'

const argv = minimist(process.argv.slice(2), {
    alias: {
        'convert': 'c',
        'space': 's',
        'validate': 'v',
        'out-file': 'o',
        'version': 'V',
        'help': 'h',
    },
    boolean: [
        'convert',
        'validate',
        'version',
        'help',
    ],
    string: [
        'space',
        'out-file',
    ],
})

if (argv.version) {
    version()
} else if (argv.help) {
    usage()
} else {
    let readStream
    if (argv._.length === 0) {
        readStream = process.stdin
    } else {
        readStream = fs.createReadStream(argv._[0])
    }

    let json5 = ''
    readStream.on('data', data => {
        json5 += data
    })

    readStream.on('end', () => {
        let space
        if (argv.space === 't' || argv.space === 'tab') {
            space = '\t'
        } else {
            space = Number(argv.space)
        }

        let value
        try {
            value = JSON5.parse(json5)
            if (!argv.validate) {
                const json = JSON.stringify(value, null, space)

                let writeStream
                if (argv.o) {
                    writeStream = fs.createReadStream(argv.o)
                } else {
                    writeStream = process.stdout
                }

                writeStream.write(json)
            }
        } catch (err) {
            console.error(err.message)
        }
    })
}

function version () {
    console.log(packageJSON.version)
}

function usage () {
    console.log(
        `
  Usage: json5 [options] <file>


  Options:

    -s, --space              The number of spaces to indent or 't' for tabs
    -o, --out-file [file]    Outputs to the specified file
    -v, --validate           Validate JSON5 but do not output JSON
    -V, --version            Output the version number
    -h, --help               Output usage information`
    )
}
