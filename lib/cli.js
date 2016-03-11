#!/usr/bin/env node

// cli.js
// JSON5 command-line interface.

var FS = require('fs');
var JSON5 = require('./json5');
var Path = require('path');
var Transform = require('stream').Transform;
var streams = require('./streams');
var yargs = require('yargs')
        .help('h').alias('h', 'help')
        .option('c', {
            alias: 'compile',
            describe: 'Compiles JSON5 files into sibling JSON files with the same basenames.',
            type: 'boolean'
        })
        .option('stdin', {
            describe: 'read JSON5 from STDIN, write JSON to STDOUT',
            type: 'boolean'
        })
        .option('indent', {
            describe: 'intentation level for pretty-printing JSON',
            default: 4
        })
        .option('o', {
            describe: 'optimize',
            type: 'boolean',
        })
        .strict()
        .check(function(argv, opts) {
            if (argv.c && argv.stdin) {
                throw new Error('conflicting options: -c and --stdin');
            }

            if (argv.c && argv._.length === 0) {
                throw new Error('-c set, but no JSON5 files given');
            }

            if (!argv.c && !argv.stdin) {
                throw new Error('not enough options');
            }

            return true;
        });

var argv = yargs.argv;

function compileFiles(files, indent) {
    var cwd = process.cwd();

    // iterate over each file and convert JSON5 files to JSON:
    files.forEach(function (file) {
        var path = Path.resolve(cwd, file);
        var basename = Path.basename(path, '.json5');
        var dirname = Path.dirname(path);

        var json5 = FS.readFileSync(path, 'utf8');
        var obj = JSON5.parse(json5);
        var json = JSON.stringify(obj, null, indent) + (indent ? "\n" : '');

        path = Path.join(dirname, basename + '.json');
        FS.writeFileSync(path, json, 'utf8');
    });
}

function streamInOut(input, output, indent)  {
    var splitIntoDocs = new streams.CharacterGateStream('}]');
    var transcoder = new streams.JSON5toJSONstream();
    input.pipe(splitIntoDocs)
        // .pipe(streams.LoggerStream('split'))
        .pipe(transcoder)
        // .pipe(streams.LoggerStream('json'))
        .pipe(output);
}

function main() {
    if (argv.c) return compileFiles(argv._, argv.indent);
    if (argv.stdin) return streamInOut(process.stdin, process.stdout, argv.indent);
}

main();
