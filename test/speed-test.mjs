// noinspection JSUnresolvedReference
/* eslint-disable camelcase */
import {requestText} from 'by-request'
import benchmark from 'benchmark'
import vm from 'vm'

// TODO: You can change the hosting of these sample files if you like, so as not to depend on
//   my personal hosting. The main idea is not to bloat the repo with large files.
const sample = (await requestText('https://shetline.com/40mb.json'))
const sample2 = sample.replace(/\s*]\s*$/s, '') +
    `,{"bigString":"${'a'.repeat(20 * 1024 * 1024)}"}]`
const sample3 = (await requestText('https://shetline.com/flights-1m.json'))
const JSON5_old_src = await requestText('https://unpkg.com/json5@2.2.3/dist/index.min.js')

vm.runInThisContext(JSON5_old_src)

// Current version of JSON5
const JSON5 = (await import('../lib/index.js')).default
const JSON5_old = global.JSON5

function runSuiteOnSampleJson (json, title, reviver) {
    const suite = new benchmark.Suite('')
    suite.add('JSON', () => JSON.parse(json, reviver))
    suite.add('Old JSON5', () => JSON5_old.parse(json, reviver))
    suite.add('JSON5', () => JSON5.parse(json, reviver))

    suite.on('cycle', event =>
        console.log(String(event.target)),
    )

    suite.on('complete', event => {
        const suite = event.currentTarget

        // Sort benchmarks by operations per second (ops/sec) in descending order
        const rankedBenchmarks = suite.slice().sort((a, b) => b.hz - a.hz)
        const lines = rankedBenchmarks.map((bench, index) => `${index + 1}. ${bench.toString()}`)
        let maxTitleLength = 0
        let maxOpsLength = 0
        let maxLineLength = 0

        for (const line of lines) {
            const $ = /^\d\. (.+?) x (\S+)/.exec(line)

            maxTitleLength = Math.max(maxTitleLength, $[1].length)
            maxOpsLength = Math.max(maxOpsLength, $[2].length)
        }

        for (let i = 0; i < lines.length; i++) {
            const $ = /^(\d\. )(.+?)( x )(\S+)(.*)$/.exec(lines[i])
            lines[i] = $[1] + $[2].padEnd(maxTitleLength) + $[3] + $[4].padStart(maxOpsLength) + $[5]
            maxLineLength = Math.max(maxLineLength, lines[i].length)
        }

        let header = `- ${title} benchmarks (ranked) -`
        const half = (maxLineLength - header.length) / 2

        header = '\n\n' + '-'.repeat(Math.floor(half)) + header + '-'.repeat(Math.ceil(half))
        console.log(header)
        lines.forEach(line => console.log(line))
        console.log('-'.repeat(maxLineLength) + '\n\n')
    })

    suite.run()
}

runSuiteOnSampleJson(sample, '40 MB sample')
runSuiteOnSampleJson(sample2, '60 MB long string sample')
runSuiteOnSampleJson(sample3, 'Flight data sample')
runSuiteOnSampleJson(sample3, 'Flight data with reviver', (k, v) => (k === 'FL_DATE' ? new Date(v) : v))
