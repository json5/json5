const rangeContains = (range, index) => (
    range.start <= index && index < range.end
)

const getLocation = ({offsetLine, range, searchIndex, offsetColumn}) => (
    {line: offsetLine + range.line, column: offsetColumn + searchIndex - range.start, character: searchIndex}
)

function getLocator (source, options = {}) {
    const offsetLine = options.offsetLine || 0
    const offsetColumn = options.offsetColumn || 0
    const originalLines = source.split('\n')

    let start = 0
    const lineRanges = originalLines.map((line, i) => {
        const end = start + line.length + 1
        const range = {start, end, line: i}

        start = end
        return range
    })

    let i = 0

    /**
     *
     * @param {string | number} search
     * @param {number} startIndex
     * @returns {object}
     */
    const locate = (search, startIndex) => {
        const searchIndex = source.indexOf(search, startIndex || 0)

        let range = lineRanges[i]

        const d = searchIndex >= range.end ? 1 : -1

        while (range) {
            if (rangeContains(range, searchIndex)) {
                return getLocation({offsetColumn, offsetLine, range, searchIndex})
            }

            i += d
            range = lineRanges[i]
        }
    }

    return locate
}

function locate (source, search, options) {
    if (typeof options === 'number') {
        throw new Error('locate takes a { startIndex, offsetLine, offsetColumn } object as the third argument')
    }

    return getLocator(source, options)(search, options && options.startIndex)
}

module.exports = locate
