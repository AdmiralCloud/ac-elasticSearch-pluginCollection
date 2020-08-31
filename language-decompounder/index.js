const _ = require('lodash')
const argv = require('minimist')(process.argv.slice(2))
const { promises: fs } = require('fs')

// https://github.com/mnater/Hyphenopoly
const hyphenopoly = require("hyphenopoly");
const hyphenator = hyphenopoly.config({
  "require": ['en-us', 'de'],
  "hyphen": "•",
  "exceptions": {
      "en-us": "en-han-ces"
  }
})

const ingest = async () => {
  const inFile = _.get(argv, 'in')
  const outFile = _.get(argv, 'out')
  const removalWords = ['\n', '\t', '']

  // "de", "en-us"
  const language = _.get(argv, 'language', 'en-us')
  console.log('Using %s', language)



  const wordlistRaw = await fs.readFile(inFile)
  let words = _.split(wordlistRaw, /\b/)
  words = _.filter(words, word => {
    if (_.indexOf(removalWords, _.trim(word)) < 0) return word
  })


  let hyphenateText = await hyphenator.get(language)
  let parts = []
  for(const word of words) {
    let hy = _.split(hyphenateText(word), '•')
    parts = _.concat(parts, hy) 
  }
/*

*/
  // sort
  parts = _.sortBy(_.uniq(parts))

  fs.writeFile(outFile, _.join(parts, '\n'))
}

ingest()