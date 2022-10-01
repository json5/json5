/**
 * Gets color functions.
 * @returns A Promise that resolves to an object of color functions.
 */
async function color() {
  const {default: chalk} = await import('chalk')
  return {
    error: chalk.red,
    filename: chalk.magenta,
    keyword: chalk.blue,
    command: chalk.green,
  }
}

exports.color = color
