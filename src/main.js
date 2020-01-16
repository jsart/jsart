import './views/index.arthtml'
import './views/about.arthtml'

const files = require.context('./views', true, /\S*\.arthtml$/)
const mainList = files.keys().map(k => {
  const pageName = k.replace(/(^\.\/|\.arthtml$)/g, '')
  const pagePath = './' + pageName + '.arthtml'
  return pagePath
})

if (module.hot) {
  module.hot.accept(mainList, () => {
    console.log('45646464564')
  })
}
