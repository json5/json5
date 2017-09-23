import assert from 'assert'
import child from 'child_process'
import fs from 'fs'
import path from 'path'

import pkg from '../package.json'

const cliPath = path.resolve(__dirname, '../lib/cli.js')

describe('CLI', function () {
    this.timeout(10000)

    it('converts JSON5 to JSON from stdin to stdout', done => {
        const proc = child.spawn(process.execPath, [cliPath])
        let output = ''
        proc.stdout.on('data', data => {
            output += data
        })

        proc.stdout.on('end', () => {
            assert.strictEqual(output, '{"a":1,"b":2}')
            done()
        })

        fs.createReadStream(path.resolve(__dirname, 'test.json5')).pipe(proc.stdin)
    })

    it('reads from the specified file', done => {
        const proc = child.spawn(
            process.execPath,
            [
                cliPath,
                path.resolve(__dirname, 'test.json5'),
            ]
        )

        let output = ''
        proc.stdout.on('data', data => {
            output += data
        })

        proc.stdout.on('end', () => {
            assert.strictEqual(output, '{"a":1,"b":2}')
            done()
        })
    })

    it('indents output with the number of spaces specified', done => {
        const proc = child.spawn(
            process.execPath,
            [
                cliPath,
                path.resolve(__dirname, 'test.json5'),
                '-s',
                '4',
            ]
        )

        let output = ''
        proc.stdout.on('data', data => {
            output += data
        })

        proc.stdout.on('end', () => {
            assert.strictEqual(output, '{\n    "a": 1,\n    "b": 2\n}')
            done()
        })
    })

    it('indents output with tabs when specified', done => {
        const proc = child.spawn(
            process.execPath,
            [
                cliPath,
                path.resolve(__dirname, 'test.json5'),
                '-s',
                't',
            ]
        )

        let output = ''
        proc.stdout.on('data', data => {
            output += data
        })

        proc.stdout.on('end', () => {
            assert.strictEqual(output, '{\n\t"a": 1,\n\t"b": 2\n}')
            done()
        })
    })

    it('outputs to the specified file', done => {
        const proc = child.spawn(
            process.execPath,
            [
                cliPath,
                path.resolve(__dirname, 'test.json5'),
                '-o',
                path.resolve(__dirname, 'output.json'),
            ]
        )

        proc.on('exit', () => {
            assert.strictEqual(
                fs.readFileSync(
                    path.resolve(__dirname, 'output.json'),
                    'utf8'
                ),
                '{"a":1,"b":2}'
            )
            done()
        })

        after(() => {
            try {
                fs.unlinkSync(path.resolve(__dirname, 'output.json'))
            } catch (err) {}
        })
    })

    it('validates valid JSON5 files', done => {
        const proc = child.spawn(
            process.execPath,
            [
                cliPath,
                path.resolve(__dirname, 'test.json5'),
                '-v',
            ]
        )

        proc.on('exit', code => {
            assert.strictEqual(code, 0)
            done()
        })
    })

    it('validates invalid JSON5 files', done => {
        const proc = child.spawn(
            process.execPath,
            [
                cliPath,
                path.resolve(__dirname, 'invalid.json5'),
                '-v',
            ]
        )

        let error = ''
        proc.stderr.on('data', data => {
            error += data
        })

        proc.stderr.on('end', () => {
            assert.strictEqual(error, "JSON5: invalid character 'a' at 1:1\n")
        })

        proc.on('exit', code => {
            assert.strictEqual(code, 1)
            done()
        })
    })

    it('outputs the version number when specified', done => {
        const proc = child.spawn(process.execPath, [cliPath, '-V'])

        let output = ''
        proc.stdout.on('data', data => {
            output += data
        })

        proc.stdout.on('end', () => {
            assert.strictEqual(output, pkg.version + '\n')
            done()
        })
    })

    it('outputs usage information when specified', done => {
        const proc = child.spawn(process.execPath, [cliPath, '-h'])

        let output = ''
        proc.stdout.on('data', data => {
            output += data
        })

        proc.stdout.on('end', () => {
            assert(/Usage/.test(output))
            done()
        })
    })

    it('is backward compatible with v0.5.1', done => {
        const proc = child.spawn(
            process.execPath,
            [
                cliPath,
                '-c',
                path.resolve(__dirname, 'test.json5'),
            ]
        )

        proc.on('exit', () => {
            assert.strictEqual(
                fs.readFileSync(
                    path.resolve(__dirname, 'test.json'),
                    'utf8'
                ),
                '{"a":1,"b":2}'
            )
            done()
        })

        after(() => {
            try {
                fs.unlinkSync(path.resolve(__dirname, 'test.json'))
            } catch (err) {}
        })
    })
})
