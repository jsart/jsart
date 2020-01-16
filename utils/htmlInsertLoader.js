const loaderUtils = require('loader-utils')
const MODE_TYPE = process.env.MODE_TYPE
const layoutSimpleFileName = 'layout-simple'

module.exports = function loaderApi(content) {
  const options = loaderUtils.getOptions(this) || {}
  const mode = options.mode || MODE_TYPE
  const jsAssetsPath = mode === 'development' ? './assets/' : '/'
  const jsContents = `<script src="${jsAssetsPath}main.js"></script></body>`

  const cssAssetsPath = mode === 'development' ? './assets/' : '/style/'
  const cssContents = `<link rel="stylesheet" href="${cssAssetsPath}${layoutSimpleFileName}.css" /></head>`

  const insertJsList = content.split('</body>')
  const insertCssList = insertJsList[0].split('</head>')
  const htmlRes = insertCssList[0] + cssContents + insertCssList[1] + jsContents + insertJsList[1]
  return htmlRes
}
